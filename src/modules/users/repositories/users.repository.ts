import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

import { TResetPeriods, TUsersStatus, USERS_STATUS } from '@contract/constants';
import { GetAllUsersV2Command } from '@libs/contracts/commands';
import { ICrud } from '@common/types/crud-port';

import { UserWithLifetimeTrafficEntity } from '../entities/user-with-lifetime-traffic.entity';
import { UserWithActiveInboundsEntity } from '../entities/user-with-active-inbounds.entity';
import { UserForConfigEntity } from '../entities/users-for-config';
import {
    IUserOnlineStats,
    IUserStats,
    USER_INCLUDE_INBOUNDS,
    USER_INCLUDE_INBOUNDS_AND_LAST_CONNECTED_NODE,
    USER_WITH_LIFETIME_TRAFFIC_INCLUDE,
} from '../interfaces';
import { UserEntity } from '../entities/users.entity';
import { UserConverter } from '../users.converter';
import { BatchResetUsersUsageBuilder } from '../builders/batch-reset-users-usage/batch-reset-users-usage.builder';
import { BulkDeleteByStatusBuilder } from '../builders/bulk-delete-by-status/bulk-delete-by-status.builder';
import { UserWithActiveInboundsAndLastConnectedNodeEntity } from '../entities/user-with-active-inbounds-and-last-connected-node.entity';
import { UsersWithInboundTagBuilder } from '../builders/users-with-inbound-tag/users-with-inbound-tag.builder';

dayjs.extend(utc);

@Injectable()
export class UsersRepository implements ICrud<UserEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly userConverter: UserConverter,
    ) {}

    public async create(entity: UserEntity): Promise<UserEntity> {
        const model = this.userConverter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.users.create({
            data: model,
        });

        return this.userConverter.fromPrismaModelToEntity(result);
    }

    public async incrementUsedTraffic(userUuid: string, bytes: bigint): Promise<void> {
        await this.prisma.tx.users.update({
            where: { uuid: userUuid },
            data: {
                usedTrafficBytes: { increment: bytes },
                onlineAt: new Date(),
                lifetimeUsedTrafficBytes: { increment: bytes },
            },
        });
    }

    public async changeUserStatus(userUuid: string, status: TUsersStatus): Promise<void> {
        await this.prisma.tx.users.update({
            where: { uuid: userUuid },
            data: { status },
        });
    }

    public async updateStatusAndTrafficAndResetAt(
        userUuid: string,
        lastResetAt: Date,
        status?: TUsersStatus,
    ): Promise<void> {
        await this.prisma.tx.users.update({
            where: { uuid: userUuid },
            data: { lastTrafficResetAt: lastResetAt, status, usedTrafficBytes: 0 },
        });
    }

    public async updateSubLastOpenedAndUserAgent(
        userUuid: string,
        subLastOpenedAt: Date,
        subLastUserAgent: string,
    ): Promise<void> {
        await this.prisma.tx.users.update({
            where: { uuid: userUuid },
            data: { subLastOpenedAt, subLastUserAgent },
        });
    }

    public async findUserByUsername(
        username: string,
    ): Promise<null | UserWithActiveInboundsEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { username },
            include: USER_INCLUDE_INBOUNDS,
        });

        if (!result) {
            return null;
        }

        return new UserWithActiveInboundsEntity(result);
    }

    public async findUserByUuid(uuid: string): Promise<null | UserWithActiveInboundsEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { uuid },
            include: USER_INCLUDE_INBOUNDS,
        });

        if (!result) {
            return null;
        }

        return new UserWithActiveInboundsEntity(result);
    }

    public async getUserWithActiveInbounds(
        uuid: string,
    ): Promise<null | UserWithActiveInboundsEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { uuid },
            include: USER_INCLUDE_INBOUNDS,
        });

        if (!result) {
            return null;
        }

        return new UserWithActiveInboundsEntity(result);
    }

    public async findAllActiveUsers(): Promise<UserWithActiveInboundsEntity[]> {
        const result = await this.prisma.tx.users.findMany({
            where: {
                status: USERS_STATUS.ACTIVE,
            },
            include: USER_INCLUDE_INBOUNDS,
        });
        return result.map((value) => new UserWithActiveInboundsEntity(value));
    }

    public async findExceededTrafficUsers(): Promise<UserWithActiveInboundsEntity[]> {
        const result = await this.prisma.tx.users.findMany({
            where: {
                AND: [
                    {
                        status: USERS_STATUS.ACTIVE,
                    },
                    {
                        trafficLimitBytes: {
                            not: 0,
                        },
                    },
                    {
                        usedTrafficBytes: {
                            gte: this.prisma.tx.users.fields.trafficLimitBytes,
                        },
                    },
                ],
            },
            include: USER_INCLUDE_INBOUNDS,
        });
        return result.map((value) => new UserWithActiveInboundsEntity(value));
    }

    public async updateExceededTrafficUsers(): Promise<{ uuid: string }[]> {
        const result = await this.prisma.tx.users.updateManyAndReturn({
            select: {
                uuid: true,
            },
            where: {
                AND: [
                    {
                        status: USERS_STATUS.ACTIVE,
                    },
                    {
                        trafficLimitBytes: {
                            not: 0,
                        },
                    },
                    {
                        usedTrafficBytes: {
                            gte: this.prisma.tx.users.fields.trafficLimitBytes,
                        },
                    },
                ],
            },
            data: {
                status: USERS_STATUS.LIMITED,
            },
        });

        return result;
    }

    public async findExpiredUsers(): Promise<UserWithActiveInboundsEntity[]> {
        const result = await this.prisma.tx.users.findMany({
            where: {
                AND: [
                    {
                        status: USERS_STATUS.ACTIVE,
                    },
                    {
                        expireAt: {
                            lt: new Date(),
                        },
                    },
                ],
            },
            include: USER_INCLUDE_INBOUNDS,
        });
        return result.map((value) => new UserWithActiveInboundsEntity(value));
    }

    public async updateExpiredUsers(): Promise<{ uuid: string }[]> {
        const result = await this.prisma.tx.users.updateManyAndReturn({
            select: {
                uuid: true,
            },
            where: {
                AND: [
                    {
                        status: USERS_STATUS.ACTIVE,
                    },
                    {
                        expireAt: {
                            lt: new Date(),
                        },
                    },
                ],
            },
            data: {
                status: USERS_STATUS.EXPIRED,
            },
        });

        return result;
    }

    public async getAllUsersByTrafficStrategyAndStatus(
        strategy: TResetPeriods,
        status: TUsersStatus,
    ): Promise<UserWithActiveInboundsEntity[]> {
        const result = await this.prisma.tx.users.findMany({
            where: {
                trafficLimitStrategy: strategy,
                status: status,
            },
            include: USER_INCLUDE_INBOUNDS,
        });

        return result.map((value) => new UserWithActiveInboundsEntity(value));
    }

    public async getUsersForConfig(): Promise<UserForConfigEntity[]> {
        const { query } = new UsersWithInboundTagBuilder();
        return await this.prisma.tx.$queryRaw<UserForConfigEntity[]>(query);
    }

    public async getAllUsersWithActiveInbounds(): Promise<UserWithActiveInboundsEntity[]> {
        const result = await this.prisma.tx.users.findMany({
            include: USER_INCLUDE_INBOUNDS,
        });

        return result.map((value) => new UserWithActiveInboundsEntity(value));
    }

    public async getAllUsersV2({
        start,
        size,
        filters,
        filterModes,
        sorting,
    }: GetAllUsersV2Command.RequestQuery): Promise<[UserWithLifetimeTrafficEntity[], number]> {
        const where = filters?.reduce((acc, filter) => {
            const mode = filterModes?.[filter.id] || 'contains';

            if (
                filter.id === 'expireAt' ||
                filter.id === 'createdAt' ||
                filter.id === 'lastTrafficResetAt' ||
                filter.id === 'subLastOpenedAt' ||
                filter.id === 'onlineAt'
            ) {
                return {
                    ...acc,
                    [filter.id]: {
                        equals: new Date(filter.value as string),
                    },
                };
            }

            return {
                ...acc,
                [filter.id]: {
                    [mode]: filter.value,
                    mode: 'insensitive' as const,
                },
            };
        }, {});

        let orderBy = sorting?.reduce(
            (acc, sort) => ({
                ...acc,
                [sort.id]: sort.desc ? 'desc' : 'asc',
            }),
            {},
        );

        if (orderBy === undefined || Object.keys(orderBy).length === 0) {
            orderBy = {
                createdAt: 'desc',
            };
        }

        const [users, total] = await Promise.all([
            this.prisma.tx.users.findMany({
                skip: start,
                take: size,
                where,
                orderBy,
                include: USER_WITH_LIFETIME_TRAFFIC_INCLUDE,
            }),
            this.prisma.tx.users.count({ where }),
        ]);

        const result = users.map((user) => {
            return new UserWithLifetimeTrafficEntity(user);
        });

        return [result, total];
    }

    public async getUserByShortUuid(
        shortUuid: string,
    ): Promise<null | UserWithActiveInboundsEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { shortUuid },
            include: {
                activeUserInbounds: {
                    select: {
                        inbound: {
                            select: {
                                uuid: true,
                                tag: true,
                                type: true,
                                network: true,
                                security: true,
                            },
                        },
                    },
                },
            },
        });

        if (!result) {
            return null;
        }

        return new UserWithActiveInboundsEntity(result);
    }

    public async getUserByUUID(uuid: string): Promise<null | UserWithActiveInboundsEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { uuid },
            include: USER_INCLUDE_INBOUNDS,
        });

        if (!result) {
            return null;
        }

        return new UserWithActiveInboundsEntity(result);
    }

    public async getUserBySubscriptionUuid(
        subscriptionUuid: string,
    ): Promise<null | UserWithActiveInboundsEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { subscriptionUuid },
            include: USER_INCLUDE_INBOUNDS,
        });

        if (!result) {
            return null;
        }

        return new UserWithActiveInboundsEntity(result);
    }

    public async findByUUID(uuid: string): Promise<null | UserEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { uuid },
        });
        if (!result) {
            return null;
        }
        return this.userConverter.fromPrismaModelToEntity(result);
    }

    public async update({ uuid, ...data }: Partial<UserEntity>): Promise<UserEntity> {
        const result = await this.prisma.tx.users.update({
            where: {
                uuid,
            },
            data,
        });

        return this.userConverter.fromPrismaModelToEntity(result);
    }

    public async updateUserWithActiveInbounds({
        uuid,
        ...data
    }: Partial<UserWithActiveInboundsEntity>): Promise<UserWithActiveInboundsEntity> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { activeUserInbounds: _, ...updateData } = data;

        const result = await this.prisma.tx.users.update({
            where: { uuid },
            data: updateData,
            include: USER_INCLUDE_INBOUNDS,
        });

        return new UserWithActiveInboundsEntity(result);
    }

    public async findByCriteria(dto: Partial<UserEntity>): Promise<UserEntity[]> {
        const bannerList = await this.prisma.tx.users.findMany({
            where: dto,
        });
        return this.userConverter.fromPrismaModelsToEntities(bannerList);
    }

    public async findUniqueByCriteria(
        dto: Partial<Pick<UserEntity, 'uuid' | 'subscriptionUuid' | 'shortUuid' | 'username'>>,
    ): Promise<UserWithActiveInboundsAndLastConnectedNodeEntity | null> {
        const user = await this.prisma.tx.users.findFirst({
            where: dto,
            include: USER_INCLUDE_INBOUNDS_AND_LAST_CONNECTED_NODE,
        });

        if (!user) {
            return null;
        }

        return new UserWithActiveInboundsAndLastConnectedNodeEntity(user);
    }

    public async findByCriteriaWithInboundsAndLastConnectedNode(
        dto: Partial<UserEntity>,
    ): Promise<UserWithActiveInboundsAndLastConnectedNodeEntity[]> {
        const bannerList = await this.prisma.tx.users.findMany({
            where: dto,
            include: USER_INCLUDE_INBOUNDS_AND_LAST_CONNECTED_NODE,
        });
        return bannerList.map((user) => new UserWithActiveInboundsAndLastConnectedNodeEntity(user));
    }

    public async findFirstByCriteria(dto: Partial<UserEntity>): Promise<null | UserEntity> {
        const result = await this.prisma.tx.users.findFirst({
            where: dto,
        });

        if (!result) {
            return null;
        }

        return this.userConverter.fromPrismaModelToEntity(result);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.users.delete({ where: { uuid } });
        return !!result;
    }

    public async getUserStats(): Promise<IUserStats> {
        const [statusCounts, totalTraffic] = await Promise.all([
            this.prisma.tx.users.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
                where: {
                    status: {
                        in: Object.values(USERS_STATUS),
                    },
                },
            }),

            this.prisma.tx.nodesUserUsageHistory.aggregate({
                _sum: {
                    totalBytes: true,
                },
            }),
        ]);

        const formattedStatusCounts = Object.values(USERS_STATUS).reduce(
            (acc, status) => ({
                ...acc,
                [status]: statusCounts.find((item) => item.status === status)?._count.status || 0,
            }),
            {} as Record<TUsersStatus, number>,
        );

        const totalUsers = Object.values(formattedStatusCounts).reduce(
            (acc, count) => acc + count,
            0,
        );

        return {
            statusCounts: formattedStatusCounts,
            totalUsers,
            totalTrafficBytes: totalTraffic._sum.totalBytes || BigInt(0),
        };
    }

    public async getUserOnlineStats(): Promise<IUserOnlineStats> {
        const now = dayjs().utc();
        const oneMinuteAgo = now.subtract(1, 'minute').toDate();
        const oneDayAgo = now.subtract(1, 'day').toDate();
        const oneWeekAgo = now.subtract(1, 'week').toDate();

        const [result] = await this.prisma.tx.$queryRaw<[IUserOnlineStats]>`
            SELECT 
                COUNT(CASE WHEN "online_at" >= ${oneMinuteAgo} THEN 1 END) as "onlineNow",
                COUNT(CASE WHEN "online_at" >= ${oneDayAgo} THEN 1 END) as "lastDay",
                COUNT(CASE WHEN "online_at" >= ${oneWeekAgo} THEN 1 END) as "lastWeek",
                COUNT(CASE WHEN "online_at" IS NULL THEN 1 END) as "neverOnline"
            FROM users
        `;

        return {
            onlineNow: Number(result.onlineNow),
            lastDay: Number(result.lastDay),
            lastWeek: Number(result.lastWeek),
            neverOnline: Number(result.neverOnline),
        };
    }

    public async resetUserTraffic(strategy: TResetPeriods): Promise<void> {
        const { query } = new BatchResetUsersUsageBuilder(strategy);
        await this.prisma.tx.$executeRaw<void>(query);

        return;
    }

    public async deleteManyByStatus(status: TUsersStatus): Promise<number> {
        const { query } = new BulkDeleteByStatusBuilder(status);

        const result = await this.prisma.tx.$executeRaw<unknown>(query);

        return result || 0;
    }
}
