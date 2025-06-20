import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { ExpressionBuilder, SelectExpression, sql } from 'kysely';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

import { TResetPeriods, TUsersStatus, USERS_STATUS } from '@contract/constants';
import { DB } from 'prisma/generated/types';

import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { getKyselyUuid } from '@common/helpers/kysely';
import { ICrud } from '@common/types/crud-port';
import { GetAllUsersCommand } from '@libs/contracts/commands';

import { ConfigProfileInboundEntity } from '@modules/config-profiles/entities';

import {
    BatchResetLimitedUsersUsageBuilder,
    BulkDeleteByStatusBuilder,
    BulkUpdateUserUsedTrafficBuilder,
} from '../builders';
import {
    BaseUserEntity,
    UserForConfigEntity,
    UserEntity,
    UserWithResolvedInboundEntity,
} from '../entities';
import { TriggerThresholdNotificationsBuilder } from '../builders/trigger-threshold-notifications-builder';
import { IUserOnlineStats, IUserStats } from '../interfaces';
import { UserConverter } from '../users.converter';

dayjs.extend(utc);

@Injectable()
export class UsersRepository implements ICrud<BaseUserEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly userConverter: UserConverter,
    ) {}

    public async create(entity: BaseUserEntity): Promise<BaseUserEntity> {
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

    public async bulkIncrementUsedTraffic(
        userUsageList: { u: string; b: string; n: string }[],
    ): Promise<{ uuid: string }[]> {
        const { query } = new BulkUpdateUserUsedTrafficBuilder(userUsageList);
        return await this.prisma.tx.$queryRaw<{ uuid: string }[]>(query);
    }

    public async triggerThresholdNotifications(percentages: number[]): Promise<{ uuid: string }[]> {
        const { query } = new TriggerThresholdNotificationsBuilder(percentages);
        return await this.prisma.tx.$queryRaw<{ uuid: string }[]>(query);
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
            data: {
                lastTrafficResetAt: lastResetAt,
                status,
                usedTrafficBytes: 0,
                lastTriggeredThreshold: 0,
            },
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

    public async findExceededTrafficUsers(): Promise<UserEntity[]> {
        const result = await this.prisma.tx.$kysely
            .selectFrom('users')
            .selectAll()
            .select((eb) => [
                this.includeActiveInternalSquads(eb),
                this.includeLastConnectedNode(eb),
            ])
            .where('status', '=', USERS_STATUS.ACTIVE)
            .where('trafficLimitBytes', '!=', 0n)
            .where((eb) => eb('usedTrafficBytes', '>=', eb.ref('trafficLimitBytes')))

            .execute();

        return result.map((value) => new UserEntity(value));
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

    public async findUsersByExpireAt(start: Date, end: Date): Promise<UserEntity[]> {
        // TODO: check this
        const result = await this.prisma.tx.$kysely
            .selectFrom('users')
            .selectAll()
            .select((eb) => this.includeActiveInternalSquads(eb))
            .select((eb) => this.includeLastConnectedNode(eb))
            .where('expireAt', '>=', start)
            .where('expireAt', '<=', end)
            .execute();
        return result.map((value) => new UserEntity(value));
    }

    public async updateExpiredUsers(): Promise<{ uuid: string }[]> {
        const result = await this.prisma.tx.users.updateManyAndReturn({
            select: {
                uuid: true,
            },
            where: {
                AND: [
                    {
                        status: {
                            in: [USERS_STATUS.ACTIVE, USERS_STATUS.LIMITED],
                        },
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

    // public async getAllUsersV2({
    //     start,
    //     size,
    //     filters,
    //     filterModes,
    //     sorting,
    // }: GetAllUsersCommand.RequestQuery): Promise<[UserWithAiAndLcnRawEntity[], number]> {
    //     const where = filters?.reduce((acc, filter) => {
    //         const mode = filterModes?.[filter.id] || 'contains';

    //         if (
    //             filter.id === 'expireAt' ||
    //             filter.id === 'createdAt' ||
    //             filter.id === 'lastTrafficResetAt' ||
    //             filter.id === 'subLastOpenedAt' ||
    //             filter.id === 'onlineAt'
    //         ) {
    //             return {
    //                 ...acc,
    //                 [filter.id]: {
    //                     equals: new Date(filter.value as string),
    //                 },
    //             };
    //         }

    //         if (filter.id === 'telegramId') {
    //             try {
    //                 const numValue = BigInt(filter.value as string);
    //                 return {
    //                     ...acc,
    //                     [filter.id]: {
    //                         equals: numValue,
    //                     },
    //                 };
    //             } catch {
    //                 return {
    //                     ...acc,
    //                     [filter.id]: {
    //                         equals: null,
    //                     },
    //                 };
    //             }
    //         }

    //         return {
    //             ...acc,
    //             [filter.id]: {
    //                 [mode]: filter.value,
    //                 mode: 'insensitive' as const,
    //             },
    //         };
    //     }, {});

    //     let orderBy = sorting?.reduce((acc, sort) => {
    //         const dateFields = [
    //             'lastTrafficResetAt',
    //             'subLastOpenedAt',
    //             'subRevokedAt',
    //             'onlineAt',
    //         ];

    //         if (dateFields.includes(sort.id)) {
    //             return {
    //                 ...acc,
    //                 [sort.id]: {
    //                     sort: sort.desc ? 'desc' : 'asc',
    //                     nulls: 'last',
    //                 },
    //             };
    //         }

    //         return {
    //             ...acc,
    //             [sort.id]: sort.desc ? 'desc' : 'asc',
    //         };
    //     }, {});

    //     if (orderBy === undefined || Object.keys(orderBy).length === 0) {
    //         orderBy = {
    //             createdAt: 'desc',
    //         };
    //     }

    //     const [users, total] = await Promise.all([
    //         this.prisma.tx.users.findMany({
    //             skip: start,
    //             take: size,
    //             where,
    //             orderBy,
    //             include: INCLUDE_ACTIVE_USER_INBOUNDS_AND_LAST_CONNECTED_NODE,
    //         }),
    //         this.prisma.tx.users.count({ where }),
    //     ]);

    //     const result = users.map((user) => {
    //         return new UserWithAiAndLcnRawEntity(user);
    //     });

    //     return [result, total];
    // }

    public async getAllUsersV2({
        start,
        size,
        filters,
        filterModes,
        sorting,
    }: GetAllUsersCommand.RequestQuery): Promise<[UserEntity[], number]> {
        const qb = this.prisma.tx.$kysely.selectFrom('users');

        let isFiltersEmpty = true;

        let whereBuilder = qb;

        if (filters?.length) {
            isFiltersEmpty = false;
            for (const filter of filters) {
                const mode = filterModes?.[filter.id] || 'contains';

                if (
                    [
                        'createdAt',
                        'expireAt',
                        'lastTrafficResetAt',
                        'onlineAt',
                        'subLastOpenedAt',
                    ].includes(filter.id)
                ) {
                    whereBuilder = whereBuilder.where(
                        filter.id as any,
                        '=',
                        new Date(filter.value as string),
                    );
                    continue;
                }

                if (filter.id === 'telegramId') {
                    try {
                        const numValue = BigInt(filter.value as string);
                        whereBuilder = whereBuilder.where('telegramId', '=', numValue);
                    } catch {
                        whereBuilder = whereBuilder.where('telegramId', 'is', null);
                    }
                    continue;
                }

                const field = filter.id as keyof DB['users'];

                switch (mode) {
                    case 'startsWith':
                        whereBuilder = whereBuilder.where(field, 'like', `${filter.value}%`);
                        break;
                    case 'endsWith':
                        whereBuilder = whereBuilder.where(field, 'like', `%${filter.value}`);
                        break;
                    case 'equals':
                        whereBuilder = whereBuilder.where(field, '=', filter.value as string);
                        break;
                    default: // 'contains'
                        whereBuilder = whereBuilder.where(field, 'like', `%${filter.value}%`);
                        break;
                }
            }
        }

        const dateFields = ['lastTrafficResetAt', 'subLastOpenedAt', 'subRevokedAt', 'onlineAt'];

        let sortBuilder = whereBuilder;
        if (sorting?.length) {
            for (const sort of sorting) {
                if (dateFields.includes(sort.id)) {
                    sortBuilder = sortBuilder.orderBy(sql.ref(sort.id), (ob) => {
                        const orderBy = sort.desc ? ob.desc() : ob.asc();
                        return orderBy.nullsLast();
                    });

                    // sortBuilder = sortBuilder.orderBy(sql.ref(sort.id), (ob) =>
                    //     ob.collate('nocase').asc().nullsLast(),
                    // );

                    // sortBuilder = sortBuilder.orderBy(sql.ref(sort.id), dir); // no "nulls last" support yet
                }
            }
        } else {
            sortBuilder = sortBuilder.orderBy('createdAt', 'desc');
        }

        const users = await sortBuilder
            .selectAll()
            .offset(start)
            .limit(size)
            .select((eb) => this.includeActiveInternalSquads(eb))
            .select((eb) => this.includeLastConnectedNode(eb))
            .execute();

        const { count } = await this.prisma.tx.$kysely
            .selectFrom('users')
            .select((eb) => eb.fn.countAll().as('count'))
            .$if(!isFiltersEmpty, (qb) => {
                let countBuilder = qb;
                for (const filter of filters!) {
                    const mode = filterModes?.[filter.id] || 'contains';

                    if (
                        [
                            'createdAt',
                            'expireAt',
                            'lastTrafficResetAt',
                            'onlineAt',
                            'subLastOpenedAt',
                        ].includes(filter.id)
                    ) {
                        countBuilder = countBuilder.where(
                            filter.id as keyof DB['users'],
                            '=',
                            new Date(filter.value as string),
                        );
                        continue;
                    }

                    if (filter.id === 'telegramId') {
                        try {
                            const numValue = BigInt(filter.value as string);
                            countBuilder = countBuilder.where('telegramId', '=', numValue);
                        } catch {
                            countBuilder = countBuilder.where('telegramId', 'is', null);
                        }
                        continue;
                    }

                    const field = filter.id as keyof DB['users'];

                    switch (mode) {
                        case 'startsWith':
                            countBuilder = countBuilder.where(field, 'like', `${filter.value}%`);
                            break;
                        case 'endsWith':
                            countBuilder = countBuilder.where(field, 'like', `%${filter.value}`);
                            break;
                        case 'equals':
                            countBuilder = countBuilder.where(field, '=', filter.value as string);
                            break;
                        default:
                            countBuilder = countBuilder.where(field, 'like', `%${filter.value}%`);
                            break;
                    }
                }
                return countBuilder;
            })
            .executeTakeFirstOrThrow();

        const result = users.map((u) => new UserEntity(u));
        return [result, Number(count)];
    }

    public async getUsersWithPagination({
        start,
        size,
    }: GetAllUsersCommand.RequestQuery): Promise<[UserEntity[], number]> {
        const [users, total] = await Promise.all([
            this.prisma.tx.$kysely
                .selectFrom('users')
                .selectAll()
                .select((eb) => this.includeActiveInternalSquads(eb))
                .select((eb) => this.includeLastConnectedNode(eb))
                .offset(start)
                .limit(size)
                .orderBy('createdAt', 'desc')
                .execute(),
            this.prisma.tx.$kysely
                .selectFrom('users')
                .select((eb) => eb.fn.countAll().as('count'))
                .executeTakeFirstOrThrow(),
        ]);

        const usersResult = users.map((user) => new UserEntity(user));

        return [usersResult, Number(total)];
    }

    public async findByUUID(uuid: string): Promise<null | BaseUserEntity> {
        const result = await this.prisma.tx.users.findUnique({
            where: { uuid },
        });
        if (!result) {
            return null;
        }
        return this.userConverter.fromPrismaModelToEntity(result);
    }

    public async update({ uuid, ...data }: Partial<BaseUserEntity>): Promise<BaseUserEntity> {
        const result = await this.prisma.tx.users.update({
            where: {
                uuid,
            },
            data,
        });

        return this.userConverter.fromPrismaModelToEntity(result);
    }

    public async updateUserStatus(uuid: string, status: TUsersStatus): Promise<boolean> {
        const result = await this.prisma.tx.$kysely
            .updateTable('users')
            .set({ status })
            .where('uuid', '=', getKyselyUuid(uuid))
            .clearReturning()
            .executeTakeFirstOrThrow();

        return !!result;
    }

    public async findByCriteria(dto: Partial<BaseUserEntity>): Promise<BaseUserEntity[]> {
        const bannerList = await this.prisma.tx.users.findMany({
            where: dto,
        });
        return this.userConverter.fromPrismaModelsToEntities(bannerList);
    }

    public async findUniqueByCriteria(
        dto: Partial<Pick<BaseUserEntity, 'uuid' | 'shortUuid' | 'username'>>,
        includeOptions: {
            activeInternalSquads: boolean;
            lastConnectedNode: boolean;
        } = {
            activeInternalSquads: true,
            lastConnectedNode: true,
        },
    ): Promise<UserEntity | null> {
        // TODO: check this
        const user = await this.prisma.tx.$kysely
            .selectFrom('users')
            .selectAll()
            .$if(includeOptions.activeInternalSquads, (qb) =>
                qb.select((eb) => this.includeActiveInternalSquads(eb)),
            )
            .$if(includeOptions.lastConnectedNode, (qb) =>
                qb.select((eb) => this.includeLastConnectedNode(eb)),
            )
            .where((eb) => {
                const conditions = [];

                if (dto.uuid) conditions.push(eb('uuid', '=', getKyselyUuid(dto.uuid)));
                if (dto.shortUuid) conditions.push(eb('shortUuid', '=', dto.shortUuid));
                if (dto.username) conditions.push(eb('username', '=', dto.username));

                return eb.or(conditions);
            })
            .executeTakeFirst();

        if (!user) {
            return null;
        }

        return new UserEntity(user);
    }

    public async findByNonUniqueCriteria(
        dto: Partial<Pick<BaseUserEntity, 'telegramId' | 'email' | 'tag'>>,
        includeOptions: {
            activeInternalSquads: boolean;
            lastConnectedNode: boolean;
        } = {
            activeInternalSquads: true,
            lastConnectedNode: true,
        },
    ): Promise<UserEntity[]> {
        // TODO: check this
        const user = await this.prisma.tx.$kysely
            .selectFrom('users')
            .selectAll()
            // .select((eb) => [
            //     this.includeActiveInternalSquads(eb),
            //     this.includeLastConnectedNode(eb),
            // ])
            .$if(includeOptions.activeInternalSquads, (qb) =>
                qb.select((eb) => this.includeActiveInternalSquads(eb)),
            )
            .$if(includeOptions.lastConnectedNode, (qb) =>
                qb.select((eb) => this.includeLastConnectedNode(eb)),
            )
            .where((eb) => {
                const conditions = [];

                if (dto.telegramId) conditions.push(eb('telegramId', '=', dto.telegramId));
                if (dto.email) conditions.push(eb('email', '=', dto.email));
                if (dto.tag) conditions.push(eb('tag', '=', dto.tag));

                return eb.or(conditions);
            })
            .execute();

        return user.map((user) => new UserEntity(user));
    }

    public async findFirstByCriteria(dto: Partial<BaseUserEntity>): Promise<null | BaseUserEntity> {
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

        const result = await this.prisma.tx.$kysely
            .selectFrom('users')
            .select((eb) => [
                eb.fn
                    .count('users.uuid')
                    .filterWhere('users.onlineAt', '>=', now.subtract(1, 'minute').toDate())
                    .as('onlineNow'),
                eb.fn
                    .count('users.uuid')
                    .filterWhere('users.onlineAt', '>=', now.subtract(1, 'day').toDate())
                    .as('lastDay'),
                eb.fn
                    .count('users.uuid')
                    .filterWhere('users.onlineAt', '>=', now.subtract(1, 'week').toDate())
                    .as('lastWeek'),
                eb.fn
                    .count('users.uuid')
                    .filterWhere('users.onlineAt', 'is', null)
                    .as('neverOnline'),
            ])
            .executeTakeFirstOrThrow();

        return {
            onlineNow: Number(result.onlineNow),
            lastDay: Number(result.lastDay),
            lastWeek: Number(result.lastWeek),
            neverOnline: Number(result.neverOnline),
        };
    }

    // public async resetUserTraffic(strategy: TResetPeriods): Promise<void> {
    //     const { query } = new BatchResetUsersUsageBuilder(strategy);
    //     await this.prisma.tx.$executeRaw<void>(query);

    //     return;
    // }

    public async resetUserTraffic(strategy: TResetPeriods): Promise<void> {
        await this.prisma.tx.$kysely
            .with('usersToReset', (db) =>
                db
                    .selectFrom('users')
                    .select(['uuid', 'usedTrafficBytes'])
                    .where('trafficLimitStrategy', '=', strategy)
                    .where('status', '!=', USERS_STATUS.LIMITED),
            )
            .with('insertHistory', (db) =>
                db
                    .insertInto('userTrafficHistory')
                    .columns(['userUuid', 'usedBytes'])
                    .expression(db.selectFrom('usersToReset').select(['uuid', 'usedTrafficBytes'])),
            )
            .updateTable('users')
            .set({
                usedTrafficBytes: 0n,
                lastTrafficResetAt: new Date(),
                lastTriggeredThreshold: 0,
            })
            .where('uuid', 'in', (eb) => eb.selectFrom('usersToReset').select('uuid'))
            .execute();
    }

    public async resetLimitedUsersTraffic(strategy: TResetPeriods): Promise<{ uuid: string }[]> {
        const { query } = new BatchResetLimitedUsersUsageBuilder(strategy);
        const result = await this.prisma.tx.$queryRaw<{ uuid: string }[]>(query);

        return result;
    }

    public async deleteManyByStatus(status: TUsersStatus, limit?: number): Promise<number> {
        const { query } = new BulkDeleteByStatusBuilder(status, limit);

        const result = await this.prisma.tx.$executeRaw<unknown>(query);

        return result || 0;
    }

    public async *getUsersForConfigStream(
        configProfileUuid: string,
        activeInbounds: ConfigProfileInboundEntity[],
    ): AsyncGenerator<UserForConfigEntity[]> {
        // TODO: configure batch size
        const BATCH_SIZE = 100_000;
        let offset = 0;
        let hasMoreData = true;

        while (hasMoreData) {
            const builder = this.prisma.tx.$kysely
                .selectFrom('internalSquadMembers')
                .innerJoin('users', (join) =>
                    join
                        .onRef('internalSquadMembers.userUuid', '=', 'users.uuid')
                        .on('users.status', '=', USERS_STATUS.ACTIVE),
                )
                .innerJoin(
                    'internalSquadInbounds',
                    'internalSquadMembers.internalSquadUuid',
                    'internalSquadInbounds.internalSquadUuid',
                )
                .innerJoin('configProfileInbounds', (join) =>
                    join
                        .onRef(
                            'internalSquadInbounds.inboundUuid',
                            '=',
                            'configProfileInbounds.uuid',
                        )
                        .on(
                            'configProfileInbounds.profileUuid',
                            '=',
                            getKyselyUuid(configProfileUuid),
                        )
                        .on(
                            'configProfileInbounds.uuid',
                            'in',
                            activeInbounds.map((inbound) => getKyselyUuid(inbound.uuid)),
                        ),
                )

                .select((eb) => [
                    'users.username',
                    'users.trojanPassword',
                    'users.vlessUuid',
                    'users.ssPassword',
                    sql<
                        string[]
                    >`coalesce(json_agg(DISTINCT ${eb.ref('configProfileInbounds.tag')}), '[]')`.as(
                        'tags',
                    ),
                ])
                .groupBy('users.uuid')
                .orderBy('users.createdAt', 'asc');

            const result = await builder.limit(BATCH_SIZE).offset(offset).execute();

            if (result.length < BATCH_SIZE) {
                hasMoreData = false;
            }

            if (result.length > 0) {
                yield result;
                offset += result.length;
            } else {
                break;
            }
        }
    }

    public async deleteManyByUuid(uuids: string[]): Promise<number> {
        const result = await this.prisma.tx.users.deleteMany({ where: { uuid: { in: uuids } } });

        return result.count;
    }

    public async bulkUpdateAllUsers(fields: Partial<BaseUserEntity>): Promise<number> {
        const result = await this.prisma.tx.users.updateMany({
            data: fields,
        });

        return result.count;
    }

    public async bulkSyncLimitedUsers(): Promise<number> {
        const result = await this.prisma.tx.users.updateMany({
            where: {
                status: 'LIMITED',
                OR: [
                    {
                        usedTrafficBytes: {
                            lt: this.prisma.tx.users.fields.trafficLimitBytes,
                        },
                    },
                    {
                        usedTrafficBytes: {
                            equals: 0n,
                        },
                    },
                ],
            },
            data: {
                status: 'ACTIVE',
            },
        });

        return result.count;
    }

    public async bulkSyncExpiredUsers(): Promise<number> {
        const result = await this.prisma.tx.users.updateMany({
            where: {
                status: 'EXPIRED',
                OR: [
                    {
                        expireAt: {
                            gt: new Date(),
                        },
                    },
                ],
            },
            data: {
                status: 'ACTIVE',
            },
        });

        return result.count;
    }

    public async bulkUpdateUsers(
        uuids: string[],
        fields: Partial<BaseUserEntity>,
    ): Promise<number> {
        const result = await this.prisma.tx.users.updateMany({
            where: { uuid: { in: uuids } },
            data: fields,
        });

        return result.count;
    }

    public async getAllTags(): Promise<string[]> {
        const result = await this.prisma.tx.users.findMany({
            select: {
                tag: true,
            },
            distinct: ['tag'],
        });

        return result.map((user) => user.tag).filter((tag) => tag !== null);
    }

    public async countByStatus(status: TUsersStatus): Promise<number> {
        const result = await this.prisma.tx.users.count({ where: { status } });

        return result;
    }

    public async removeUsersFromInternalSquads(usersUuids: string[]): Promise<void> {
        // TODO: check this
        await this.prisma.tx.$kysely
            .deleteFrom('internalSquadMembers')
            .where(
                'userUuid',
                'in',
                usersUuids.map((uuid) => getKyselyUuid(uuid)),
            )
            .execute();
    }

    public async addUsersToInternalSquads(
        usersUuids: string[],
        internalSquadsUuids: string[],
    ): Promise<void> {
        // TODO: check this
        await this.prisma.tx.$kysely
            .insertInto('internalSquadMembers')
            .columns(['userUuid', 'internalSquadUuid'])
            .values(
                usersUuids.flatMap((userUuid) =>
                    internalSquadsUuids.map((internalSquadUuid) => ({
                        userUuid: getKyselyUuid(userUuid),
                        internalSquadUuid: getKyselyUuid(internalSquadUuid),
                    })),
                ),
            )
            .execute();
    }

    public async addUserToInternalSquads(
        userUuid: string,
        internalSquadUuid: string[],
    ): Promise<boolean> {
        // TODO: check this
        if (internalSquadUuid.length === 0) {
            return true;
        }

        const result = await this.prisma.tx.$kysely
            .insertInto('internalSquadMembers')
            .columns(['userUuid', 'internalSquadUuid'])
            .values(
                internalSquadUuid.map((internalSquadUuid) => ({
                    userUuid: getKyselyUuid(userUuid),
                    internalSquadUuid: getKyselyUuid(internalSquadUuid),
                })),
            )
            .onConflict((oc) => oc.doNothing())
            .clearReturning()
            .executeTakeFirst();

        return !!result;
    }

    public async removeUserFromInternalSquads(userUuid: string): Promise<void> {
        await this.prisma.tx.$kysely
            .deleteFrom('internalSquadMembers')
            .where('userUuid', '=', getKyselyUuid(userUuid))
            .clearReturning()
            .executeTakeFirst();
    }

    public async getPartialUserByUniqueFields<T extends SelectExpression<DB, 'users'>>(
        dto: Partial<Pick<BaseUserEntity, 'uuid' | 'shortUuid' | 'username'>>,
        select: T[],
    ) {
        // TODO: check this
        const user = await this.prisma.tx.$kysely
            .selectFrom('users')
            .select(select)
            .where((eb) => {
                const conditions = [];

                if (dto.uuid) conditions.push(eb('uuid', '=', getKyselyUuid(dto.uuid)));
                if (dto.shortUuid) conditions.push(eb('shortUuid', '=', dto.shortUuid));
                if (dto.username) conditions.push(eb('username', '=', dto.username));

                return eb.or(conditions);
            })
            .executeTakeFirst();

        return user;
    }

    public async revokeUserSubscription(
        dto: Pick<
            BaseUserEntity,
            'uuid' | 'trojanPassword' | 'vlessUuid' | 'ssPassword' | 'subRevokedAt' | 'shortUuid'
        >,
    ): Promise<boolean> {
        const result = await this.prisma.tx.$kysely
            .updateTable('users')
            .set({
                subRevokedAt: dto.subRevokedAt,
                trojanPassword: dto.trojanPassword,
                vlessUuid: dto.vlessUuid,
                ssPassword: dto.ssPassword,
                shortUuid: dto.shortUuid,
            })
            .where('uuid', '=', getKyselyUuid(dto.uuid))
            .executeTakeFirst();

        return !!result;
    }

    // public async getUserWithResolvedInbounds(
    //     userUuid: string,
    // ): Promise<UserWithResolvedInboundEntity> {
    //     // TODO: check later
    //     const result = await this.prisma.tx.$kysely
    //         .selectFrom('internalSquadMembers')
    //         .innerJoin(
    //             'internalSquads',
    //             'internalSquadMembers.internalSquadUuid',
    //             'internalSquads.uuid',
    //         )
    //         .innerJoin(
    //             'internalSquadInbounds',
    //             'internalSquads.uuid',
    //             'internalSquadInbounds.internalSquadUuid',
    //         )
    //         .innerJoin(
    //             'configProfileInbounds',
    //             'internalSquadInbounds.inboundUuid',
    //             'configProfileInbounds.uuid',
    //         )
    //         .innerJoin('users', 'internalSquadMembers.userUuid', 'users.uuid')
    //         .select((eb) => [
    //             'users.uuid as userUuid',
    //             'users.username',
    //             'users.trojanPassword',
    //             'users.vlessUuid',
    //             'users.ssPassword',
    //             'configProfileInbounds.profileUuid',
    //             'configProfileInbounds.uuid as inboundUuid',
    //             'configProfileInbounds.tag',
    //             'configProfileInbounds.type',
    //             'configProfileInbounds.network',
    //             'configProfileInbounds.security',
    //             'configProfileInbounds.port',

    //             // jsonObjectFrom(
    //             //     eb
    //             //         .selectFrom('configProfileInbounds')
    //             //         .select([
    //             //             'uuid',
    //             //             'tag',
    //             //             'type',
    //             //             'network',
    //             //             'security',
    //             //             'port',
    //             //             'profileUuid',
    //             //         ])
    //             //         .whereRef(
    //             //             'configProfileInbounds.uuid',
    //             //             '=',
    //             //             'internalSquadInbounds.inboundUuid',
    //             //         ),
    //             // ).as('inbound'),
    //         ])
    //         .where('users.uuid', '=', getKyselyUuid(userUuid))
    //         .execute();

    //     if (result.length === 0) {
    //         throw new Error('User not found or no inbounds');
    //     }

    //     const { userUuid: uuid, username, trojanPassword, vlessUuid, ssPassword } = result[0];

    //     const inbounds = result.map((row) => ({
    //         profileUuid: row.profileUuid,
    //         inboundUuid: row.inboundUuid,
    //         tag: row.tag,
    //         type: row.type,
    //         network: row.network,
    //         security: row.security,
    //         port: row.port,
    //     }));

    //     return new UserWithResolvedInboundEntity({
    //         userUuid: uuid,
    //         username,
    //         trojanPassword,
    //         vlessUuid,
    //         ssPassword,
    //         inbounds,
    //     });
    // }

    public async getUserWithResolvedInbounds(
        userUuid: string,
    ): Promise<UserWithResolvedInboundEntity | null> {
        // TODO: check later
        const result = await this.prisma.tx.$kysely
            .selectFrom('users')
            .select((eb) => [
                'users.uuid as userUuid',
                'users.username',
                'users.trojanPassword',
                'users.vlessUuid',
                'users.ssPassword',
                jsonArrayFrom(
                    eb
                        .selectFrom('internalSquadMembers')
                        .innerJoin(
                            'internalSquads',
                            'internalSquadMembers.internalSquadUuid',
                            'internalSquads.uuid',
                        )
                        .innerJoin(
                            'internalSquadInbounds',
                            'internalSquads.uuid',
                            'internalSquadInbounds.internalSquadUuid',
                        )
                        .innerJoin(
                            'configProfileInbounds',
                            'internalSquadInbounds.inboundUuid',
                            'configProfileInbounds.uuid',
                        )
                        .select([
                            'configProfileInbounds.profileUuid',
                            'configProfileInbounds.uuid',
                            'configProfileInbounds.tag',
                            'configProfileInbounds.type',
                            'configProfileInbounds.network',
                            'configProfileInbounds.security',
                            'configProfileInbounds.port',
                            'configProfileInbounds.rawInbound',
                        ])
                        .whereRef('internalSquadMembers.userUuid', '=', 'users.uuid'),
                )
                    .$notNull()
                    .as('inbounds'),
            ])
            .where('users.uuid', '=', getKyselyUuid(userUuid))
            .executeTakeFirst();

        if (!result) {
            return null;
        }

        return new UserWithResolvedInboundEntity(result);
    }

    private includeActiveInternalSquads(eb: ExpressionBuilder<DB, 'users'>) {
        return jsonArrayFrom(
            eb
                .selectFrom('internalSquadMembers')
                .innerJoin(
                    'internalSquads',
                    'internalSquads.uuid',
                    'internalSquadMembers.internalSquadUuid',
                )
                .select(['internalSquads.uuid', 'internalSquads.name'])
                .whereRef('internalSquadMembers.userUuid', '=', 'users.uuid'),
        ).as('activeInternalSquads');
    }

    private includeLastConnectedNode(eb: ExpressionBuilder<DB, 'users'>) {
        return jsonObjectFrom(
            eb
                .selectFrom('nodes')
                .select(['name'])
                .whereRef('nodes.uuid', '=', 'users.lastConnectedNodeUuid'),
        ).as('lastConnectedNode');
    }
}
