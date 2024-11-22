import { Injectable, Logger } from '@nestjs/common';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS, USERS_STATUS } from '@libs/contracts/constants';
import { UsersRepository } from './repositories/users.repository';
import { UserEntity } from './entities/users.entity';
import { CreateUserRequestDto } from './dtos';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { CreateManyUserActiveInboundsCommand } from '../inbounds/commands/create-many-user-active-inbounds';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { UserWithActiveInboundsEntity } from './entities/user-with-active-inbounds.entity';
import { AddUserToNodeEvent } from '../nodes/events/add-user-to-node/add-user-to-node.event';
import { Transactional } from '@nestjs-cls/transactional';
import { DeleteUserResponseModel } from './models/delete-user.response.model';
import { RemoveUserFromNodeEvent } from '../nodes/events/remove-user-from-node';
@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly userRepository: UsersRepository,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async createUser(
        dto: CreateUserRequestDto,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        const user = await this.createUserTransactional(dto);

        if (!user.isOk || !user.response) {
            return user;
        }

        this.eventBus.publish(new AddUserToNodeEvent(user.response));

        return user;
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
                enabledInbounds,
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

            if (enabledInbounds) {
                const inboundUuids = enabledInbounds.map((inbound) => inbound.uuid);
                const inboundResult = await this.createManyUserActiveInbounds({
                    userUuid: result.uuid,
                    inboundUuids,
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

    public async getAllUsers(
        limit: number,
        offset: number,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity[]>> {
        try {
            const result = await this.userRepository.getAllUsersWithActiveInboundsWithPagination(
                limit,
                offset,
            );

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
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
            user.shortUuid = this.createNanoId();
            user.subscriptionUuid = this.createUuid();
            user.trojanPassword = this.createTrojanPassword();
            user.vlessUuid = this.createUuid();
            user.ssPassword = this.createTrojanPassword();
            user.subRevokedAt = new Date();

            await this.userRepository.updateUserWithActiveInbounds(user);

            // ! TODO: add event emitter for revoked subscription

            return {
                isOk: true,
                response: user,
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

            user.status = USERS_STATUS.DISABLED;

            await this.userRepository.updateUserWithActiveInbounds(user);

            // !TDOO: add event emitter for revoked subscription

            return {
                isOk: true,
                response: user,
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

            user.status = USERS_STATUS.ACTIVE;

            await this.userRepository.updateUserWithActiveInbounds(user);

            // !TDOO: add event emitter for enabled user

            return {
                isOk: true,
                response: user,
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
}
