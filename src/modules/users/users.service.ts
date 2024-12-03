import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS, EVENTS, USERS_STATUS } from '@libs/contracts/constants';
import { Transactional } from '@nestjs-cls/transactional';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { CreateManyUserActiveInboundsCommand } from '../inbounds/commands/create-many-user-active-inbounds';
import { AddUserToNodeEvent } from '../nodes/events/add-user-to-node/add-user-to-node.event';
import { RemoveUserFromNodeEvent } from '../nodes/events/remove-user-from-node';
import { CreateUserRequestDto, UpdateUserRequestDto } from './dtos';
import { UserWithActiveInboundsEntity } from './entities/user-with-active-inbounds.entity';
import { UserEntity } from './entities/users.entity';
import { DeleteUserResponseModel } from './models/delete-user.response.model';
import { UsersRepository } from './repositories/users.repository';
import { IGetUsersOptions } from './interfaces';
import { UserWithLifetimeTrafficEntity } from './entities/user-with-lifetime-traffic.entity';
import { DeleteManyActiveInboubdsByUserUuidCommand } from '../inbounds/commands/delete-many-active-inboubds-by-user-uuid';
import { ReaddUserToNodeEvent } from '../nodes/events/readd-user-to-node/readd-user-to-node.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';
import { GetAllUsersV2Command } from '@libs/contracts/commands';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly userRepository: UsersRepository,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    public async createUser(
        dto: CreateUserRequestDto,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        const user = await this.createUserTransactional(dto);

        if (!user.isOk || !user.response) {
            return user;
        }

        this.eventBus.publish(new AddUserToNodeEvent(user.response));
        this.eventEmitter.emit(EVENTS.USER.CREATED, new UserEvent(user.response));
        return user;
    }

    public async updateUser(dto: UpdateUserRequestDto): Promise<
        ICommandResponse<{
            user: UserWithActiveInboundsEntity;
            inboubdsChanged: boolean;
            oldInboundTags: string[];
        }>
    > {
        const user = await this.updateUserTransactional(dto);

        if (!user.isOk || !user.response) {
            return user;
        }

        if (user.response.inboubdsChanged) {
            this.eventBus.publish(
                new ReaddUserToNodeEvent(user.response.user, user.response.oldInboundTags),
            );
        }

        this.eventEmitter.emit(EVENTS.USER.MODIFIED, new UserEvent(user.response.user));

        return user;
    }

    @Transactional()
    public async updateUserTransactional(dto: UpdateUserRequestDto): Promise<
        ICommandResponse<{
            user: UserWithActiveInboundsEntity;
            inboubdsChanged: boolean;
            oldInboundTags: string[];
        }>
    > {
        try {
            const {
                uuid,
                expireAt,
                trafficLimitBytes,
                trafficLimitStrategy,
                status,
                activeUserInbounds,
            } = dto;

            const user = await this.userRepository.getUserByUUID(uuid);
            if (!user) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            const result = await this.userRepository.update({
                uuid: user.uuid,
                expireAt: expireAt ? new Date(expireAt) : undefined,
                trafficLimitBytes: trafficLimitBytes ? BigInt(trafficLimitBytes) : undefined,
                trafficLimitStrategy: trafficLimitStrategy || undefined,
                status: status || undefined,
            });

            let inboundsChanged = false;
            let oldInboundTags: string[] = [];

            if (activeUserInbounds) {
                const newInboundUuids = activeUserInbounds;

                const currentInboundUuids =
                    user.activeUserInbounds?.map((inbound) => inbound.uuid) || [];

                oldInboundTags = user.activeUserInbounds?.map((inbound) => inbound.tag) || [];

                const hasChanges =
                    newInboundUuids.length !== currentInboundUuids.length ||
                    !newInboundUuids.every((uuid) => currentInboundUuids.includes(uuid));

                if (hasChanges) {
                    inboundsChanged = true;
                    await this.deleteManyActiveInboubdsByUserUuid({
                        userUuid: result.uuid,
                    });

                    const inboundResult = await this.createManyUserActiveInbounds({
                        userUuid: result.uuid,
                        inboundUuids: newInboundUuids,
                    });

                    if (!inboundResult.isOk) {
                        return {
                            isOk: false,
                            ...ERRORS.UPDATE_USER_WITH_INBOUNDS_ERROR,
                        };
                    }
                }
            }

            const userWithInbounds = await this.userRepository.getUserWithActiveInbounds(
                result.uuid,
            );

            if (!userWithInbounds) {
                return {
                    isOk: false,
                    ...ERRORS.CANT_GET_CREATED_USER_WITH_INBOUNDS,
                };
            }

            return {
                isOk: true,
                response: {
                    user: userWithInbounds,
                    inboubdsChanged: inboundsChanged,
                    oldInboundTags: oldInboundTags,
                },
            };
        } catch (error) {
            this.logger.error(error);
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                error.meta?.modelName === 'Users' &&
                Array.isArray(error.meta.target)
            ) {
                const fields = error.meta.target as string[];
                if (fields.includes('username')) {
                    return { isOk: false, ...ERRORS.USER_USERNAME_ALREADY_EXISTS };
                }
                if (fields.includes('shortUuid')) {
                    return { isOk: false, ...ERRORS.USER_SHORT_UUID_ALREADY_EXISTS };
                }
                if (fields.includes('subscriptionUuid')) {
                    return { isOk: false, ...ERRORS.USER_SUBSCRIPTION_UUID_ALREADY_EXISTS };
                }
            }

            return { isOk: false, ...ERRORS.CREATE_NODE_ERROR };
        }
    }

    @Transactional()
    public async createUserTransactional(
        dto: CreateUserRequestDto,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        try {
            const {
                username,
                subscriptionUuid,
                expireAt,
                trafficLimitBytes,
                trafficLimitStrategy,
                status,
                shortUuid,
                trojanPassword,
                vlessUuid,
                ssPassword,
                activeUserInbounds,
            } = dto;

            const userEntity = new UserEntity({
                username,
                subscriptionUuid: subscriptionUuid || this.createUuid(),
                shortUuid: shortUuid || this.createNanoId(),
                trojanPassword: trojanPassword || this.createTrojanPassword(),
                vlessUuid: vlessUuid || this.createUuid(),
                ssPassword: ssPassword || this.createTrojanPassword(),
                status,
                trafficLimitBytes: BigInt(trafficLimitBytes || 0),
                trafficLimitStrategy,
                expireAt: new Date(expireAt),
            });

            const result = await this.userRepository.create(userEntity);

            if (activeUserInbounds) {
                const inboundResult = await this.createManyUserActiveInbounds({
                    userUuid: result.uuid,
                    inboundUuids: activeUserInbounds,
                });
                if (!inboundResult.isOk) {
                    return {
                        isOk: false,
                        ...ERRORS.CREATE_USER_WITH_INBOUNDS_ERROR,
                    };
                }
            }

            const userWithInbounds = await this.userRepository.getUserWithActiveInbounds(
                result.uuid,
            );

            if (!userWithInbounds) {
                return {
                    isOk: false,
                    ...ERRORS.CANT_GET_CREATED_USER_WITH_INBOUNDS,
                };
            }

            // !TDOO: add event emitter for user creation

            return {
                isOk: true,
                response: userWithInbounds,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                error.meta?.modelName === 'Users' &&
                Array.isArray(error.meta.target)
            ) {
                const fields = error.meta.target as string[];
                if (fields.includes('username')) {
                    return { isOk: false, ...ERRORS.USER_USERNAME_ALREADY_EXISTS };
                }
                if (fields.includes('shortUuid')) {
                    return { isOk: false, ...ERRORS.USER_SHORT_UUID_ALREADY_EXISTS };
                }
                if (fields.includes('subscriptionUuid')) {
                    return { isOk: false, ...ERRORS.USER_SUBSCRIPTION_UUID_ALREADY_EXISTS };
                }
            }

            return { isOk: false, ...ERRORS.CREATE_NODE_ERROR };
        }
    }

    public async getAllUsers(options: IGetUsersOptions): Promise<
        ICommandResponse<{
            users: UserWithLifetimeTrafficEntity[];
            total: number;
        }>
    > {
        try {
            const [users, total] =
                await this.userRepository.getAllUsersWithActiveInboundsWithPagination(options);

            return {
                isOk: true,
                response: {
                    users,
                    total,
                },
            };
        } catch (error) {
            this.logger.error(error);
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.GET_ALL_USERS_ERROR,
            };
        }
    }

    public async getAllUsersV2(dto: GetAllUsersV2Command.RequestQuery): Promise<
        ICommandResponse<{
            users: UserWithLifetimeTrafficEntity[];
            total: number;
        }>
    > {
        try {
            const [users, total] = await this.userRepository.getAllUsersV2(dto);

            return {
                isOk: true,
                response: {
                    users,
                    total,
                },
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.GET_ALL_USERS_ERROR,
            };
        }
    }

    public async getUserByShortUuid(
        shortUuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        try {
            const result = await this.userRepository.getUserByShortUuid(shortUuid);

            if (!result) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.GET_USER_BY_ERROR,
            };
        }
    }

    public async getUserByUuid(
        uuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        try {
            const result = await this.userRepository.getUserByUUID(uuid);

            if (!result) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.GET_USER_BY_ERROR,
            };
        }
    }

    public async getUserBySubscriptionUuid(
        subscriptionUuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        try {
            const result = await this.userRepository.getUserBySubscriptionUuid(subscriptionUuid);

            if (!result) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.GET_USER_BY_ERROR,
            };
        }
    }

    public async revokeUserSubscription(
        userUuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        try {
            const user = await this.userRepository.getUserByUUID(userUuid);
            if (!user) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }
            const updatedUser = await this.userRepository.updateUserWithActiveInbounds({
                uuid: user.uuid,
                shortUuid: this.createNanoId(),
                subscriptionUuid: this.createUuid(),
                trojanPassword: this.createTrojanPassword(),
                vlessUuid: this.createUuid(),
                ssPassword: this.createTrojanPassword(),
                subRevokedAt: new Date(),
            });

            // ! TODO: add event emitter for revoked subscription
            if (updatedUser.status === USERS_STATUS.ACTIVE) {
                await this.eventBus.publish(new ReaddUserToNodeEvent(updatedUser));
            }

            this.eventEmitter.emit(EVENTS.USER.REVOKED, new UserEvent(updatedUser));

            return {
                isOk: true,
                response: updatedUser,
            };
        } catch (error) {
            this.logger.error(error);
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.REVOKE_USER_SUBSCRIPTION_ERROR,
            };
        }
    }

    public async deleteUser(userUuid: string): Promise<ICommandResponse<DeleteUserResponseModel>> {
        try {
            const user = await this.userRepository.getUserByUUID(userUuid);
            if (!user) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }
            const result = await this.userRepository.deleteByUUID(user.uuid);

            this.eventBus.publish(new RemoveUserFromNodeEvent(user));
            this.eventEmitter.emit(EVENTS.USER.DELETED, new UserEvent(user));
            return {
                isOk: true,
                response: new DeleteUserResponseModel(result),
            };
        } catch (error) {
            this.logger.error(error);
            this.logger.error(JSON.stringify(error));
            return { isOk: false, ...ERRORS.DELETE_USER_ERROR };
        }
    }

    public async disableUser(
        userUuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        try {
            const user = await this.userRepository.getUserByUUID(userUuid);
            if (!user) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            if (user.status === USERS_STATUS.DISABLED) {
                return {
                    isOk: false,
                    ...ERRORS.USER_ALREADY_DISABLED,
                };
            }

            const updatedUser = await this.userRepository.updateUserWithActiveInbounds({
                uuid: user.uuid,
                status: USERS_STATUS.DISABLED,
            });

            this.eventBus.publish(new RemoveUserFromNodeEvent(user));
            this.eventEmitter.emit(EVENTS.USER.DISABLED, new UserEvent(user));

            return {
                isOk: true,
                response: updatedUser,
            };
        } catch (error) {
            this.logger.error(error);
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.DISABLE_USER_ERROR,
            };
        }
    }

    public async enableUser(
        userUuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        try {
            const user = await this.userRepository.getUserByUUID(userUuid);
            if (!user) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            if (user.status === USERS_STATUS.ACTIVE) {
                return {
                    isOk: false,
                    ...ERRORS.USER_ALREADY_ENABLED,
                };
            }

            const updatedUser = await this.userRepository.updateUserWithActiveInbounds({
                uuid: user.uuid,
                status: USERS_STATUS.ACTIVE,
            });

            this.eventBus.publish(new AddUserToNodeEvent(user));
            this.eventEmitter.emit(EVENTS.USER.ENABLED, new UserEvent(user));

            return {
                isOk: true,
                response: updatedUser,
            };
        } catch (error) {
            this.logger.error(error);
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.ENABLE_USER_ERROR,
            };
        }
    }

    private createUuid(): string {
        return uuidv4();
    }

    private createNanoId(): string {
        return nanoid();
    }

    private createTrojanPassword(): string {
        return nanoid(16);
    }

    private async createManyUserActiveInbounds(
        dto: CreateManyUserActiveInboundsCommand,
    ): Promise<ICommandResponse<number>> {
        return this.commandBus.execute<
            CreateManyUserActiveInboundsCommand,
            ICommandResponse<number>
        >(new CreateManyUserActiveInboundsCommand(dto.userUuid, dto.inboundUuids));
    }

    private async deleteManyActiveInboubdsByUserUuid(
        dto: DeleteManyActiveInboubdsByUserUuidCommand,
    ): Promise<ICommandResponse<number>> {
        return this.commandBus.execute<
            DeleteManyActiveInboubdsByUserUuidCommand,
            ICommandResponse<number>
        >(new DeleteManyActiveInboubdsByUserUuidCommand(dto.userUuid));
    }
}
