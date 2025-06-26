import { jsonArrayFrom } from 'kysely/helpers/postgres';

import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { ICrud } from '@common/types/crud-port';
import { getKyselyUuid } from '@common/helpers';

import { InternalSquadEntity } from '../entities/internal-squad.entity';
import { InternalSquadConverter } from '../internal-squad.converter';
import { InternalSquadWithInfoEntity } from '../entities';

@Injectable()
export class InternalSquadRepository implements ICrud<InternalSquadEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly internalSquadConverter: InternalSquadConverter,
    ) {}

    public async create(entity: InternalSquadEntity): Promise<InternalSquadEntity> {
        const model = this.internalSquadConverter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.internalSquads.create({
            data: model,
        });

        return this.internalSquadConverter.fromPrismaModelToEntity(result);
    }

    public async findByUUID(uuid: string): Promise<InternalSquadEntity | null> {
        const result = await this.prisma.tx.internalSquads.findUnique({
            where: { uuid },
        });
        if (!result) {
            return null;
        }
        return this.internalSquadConverter.fromPrismaModelToEntity(result);
    }

    public async update({
        uuid,
        ...data
    }: Partial<InternalSquadEntity>): Promise<InternalSquadEntity> {
        const result = await this.prisma.tx.internalSquads.update({
            where: {
                uuid,
            },
            data,
        });

        return this.internalSquadConverter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(dto: Partial<InternalSquadEntity>): Promise<InternalSquadEntity[]> {
        const internalSquadList = await this.prisma.tx.internalSquads.findMany({
            where: dto,
        });
        return this.internalSquadConverter.fromPrismaModelsToEntities(internalSquadList);
    }

    public async findFirstByCriteria(
        dto: Partial<InternalSquadEntity>,
    ): Promise<InternalSquadEntity | null> {
        const result = await this.prisma.tx.internalSquads.findFirst({
            where: dto,
        });

        if (!result) {
            return null;
        }

        return this.internalSquadConverter.fromPrismaModelToEntity(result);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.internalSquads.delete({ where: { uuid } });
        return !!result;
    }

    public async getInternalSquads(): Promise<InternalSquadWithInfoEntity[]> {
        const result = await this.prisma.tx.$kysely
            .selectFrom('internalSquads')
            .select((eb) => [
                'internalSquads.uuid',
                'internalSquads.name',
                'internalSquads.createdAt',
                'internalSquads.updatedAt',

                eb
                    .selectFrom('internalSquadMembers')
                    .select(eb.fn.countAll().as('count'))
                    .whereRef('internalSquadMembers.internalSquadUuid', '=', 'internalSquads.uuid')
                    .as('membersCount'),

                // TODO: add members list
                // jsonArrayFrom(
                //     eb
                //         .selectFrom('internalSquadMembers')
                //         .select(['userUuid'])
                //         .whereRef(
                //             'internalSquadMembers.internalSquadUuid',
                //             '=',
                //             'internalSquads.uuid',
                //         ),
                // ).as('members'),

                eb
                    .selectFrom('internalSquadInbounds')
                    .select(eb.fn.countAll().as('count'))
                    .whereRef('internalSquadInbounds.internalSquadUuid', '=', 'internalSquads.uuid')
                    .as('inboundsCount'),

                jsonArrayFrom(
                    eb
                        .selectFrom('configProfileInbounds')
                        .selectAll()
                        .where(
                            'configProfileInbounds.uuid',
                            'in',
                            eb
                                .selectFrom('internalSquadInbounds')
                                .select('inboundUuid')
                                .whereRef(
                                    'internalSquadInbounds.internalSquadUuid',
                                    '=',
                                    'internalSquads.uuid',
                                ),
                        ),
                ).as('inbounds'),

                // jsonArrayFrom(
                //     eb
                //         .selectFrom('internalSquadInbounds')
                //         .leftJoin(
                //             'configProfileInbounds',
                //             'configProfileInbounds.uuid',
                //             'internalSquadInbounds.inboundUuid',
                //         )
                //         .selectAll('configProfileInbounds')
                //         .whereRef(
                //             'internalSquadInbounds.internalSquadUuid',
                //             '=',
                //             'internalSquads.uuid',
                //         ),
                // ).as('inbounds'),
            ])

            .groupBy([
                'internalSquads.uuid',
                'internalSquads.name',
                'internalSquads.createdAt',
                'internalSquads.updatedAt',
            ])
            .orderBy('internalSquads.createdAt', 'asc')
            .execute();

        return result.map((item) => new InternalSquadWithInfoEntity(item));
    }

    public async getInternalSquadsByUuid(
        uuid: string,
    ): Promise<InternalSquadWithInfoEntity | null> {
        const result = await this.prisma.tx.$kysely
            .selectFrom('internalSquads')
            .where('internalSquads.uuid', '=', getKyselyUuid(uuid))
            .select((eb) => [
                'internalSquads.uuid',
                'internalSquads.name',
                'internalSquads.createdAt',
                'internalSquads.updatedAt',

                eb
                    .selectFrom('internalSquadMembers')
                    .select(eb.fn.countAll().as('count'))
                    .whereRef('internalSquadMembers.internalSquadUuid', '=', 'internalSquads.uuid')
                    .as('membersCount'),

                eb
                    .selectFrom('internalSquadInbounds')
                    .select(eb.fn.countAll().as('count'))
                    .whereRef('internalSquadInbounds.internalSquadUuid', '=', 'internalSquads.uuid')
                    .as('inboundsCount'),

                jsonArrayFrom(
                    eb
                        .selectFrom('configProfileInbounds')
                        .selectAll()
                        .where(
                            'configProfileInbounds.uuid',
                            'in',
                            eb
                                .selectFrom('internalSquadInbounds')
                                .select('inboundUuid')
                                .whereRef(
                                    'internalSquadInbounds.internalSquadUuid',
                                    '=',
                                    'internalSquads.uuid',
                                ),
                        ),
                ).as('inbounds'),
            ])

            .groupBy([
                'internalSquads.uuid',
                'internalSquads.name',
                'internalSquads.createdAt',
                'internalSquads.updatedAt',
            ])
            .orderBy('internalSquads.createdAt', 'asc')
            .executeTakeFirst();

        if (!result) {
            return null;
        }

        return new InternalSquadWithInfoEntity(result);
    }

    public async createInbounds(
        inbounds: string[],
        internalSquadUuid: string,
    ): Promise<{
        affectedCount: number;
    }> {
        const result = await this.prisma.tx.internalSquadInbounds.createMany({
            data: inbounds.map((inbound) => ({
                inboundUuid: inbound,
                internalSquadUuid,
            })),
        });

        return {
            affectedCount: result.count,
        };
    }

    public async cleanInbounds(internalSquadUuid: string): Promise<{
        affectedCount: number;
    }> {
        const result = await this.prisma.tx.internalSquadInbounds.deleteMany({
            where: {
                internalSquadUuid,
            },
        });

        return {
            affectedCount: result.count,
        };
    }

    public async addUsersToInternalSquad(internalSquadUuid: string): Promise<{
        affectedCount: number;
    }> {
        const result = await this.prisma.tx.$kysely
            .insertInto('internalSquadMembers')
            .columns(['internalSquadUuid', 'userUuid'])
            .expression((eb) =>
                eb
                    .selectFrom('users')
                    .select([
                        eb.val(getKyselyUuid(internalSquadUuid)).as('internalSquadUuid'),
                        'uuid as userUuid',
                    ]),
            )
            .onConflict((oc) => oc.doNothing())
            .clearReturning()
            .executeTakeFirstOrThrow();

        return {
            affectedCount: Number(result.numInsertedOrUpdatedRows),
        };
    }

    public async removeUsersFromInternalSquad(internalSquadUuid: string): Promise<{
        affectedCount: number;
    }> {
        const result = await this.prisma.tx.$kysely
            .deleteFrom('internalSquadMembers')
            .where('internalSquadUuid', '=', getKyselyUuid(internalSquadUuid))
            .executeTakeFirst();

        return {
            affectedCount: Number(result.numDeletedRows),
        };
    }

    public async getConfigProfilesBySquadUuid(internalSquadUuid: string): Promise<string[]> {
        const configProfileUuids = await this.prisma.tx.$kysely
            .selectFrom('internalSquadInbounds as isi')
            .innerJoin('configProfileInbounds as cpi', 'cpi.uuid', 'isi.inboundUuid')
            .select('cpi.profileUuid')
            .distinct()
            .where('isi.internalSquadUuid', '=', getKyselyUuid(internalSquadUuid))
            .execute();

        return configProfileUuids.map((row) => row.profileUuid);
    }
}
