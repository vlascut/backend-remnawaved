import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { ICrud } from '@common/types/crud-port';

import { UserTrafficHistoryEntity } from '../entities/user-traffic-history.entity';
import { UserTrafficHistoryConverter } from '../user-traffic-history.converter';

@Injectable()
export class UserTrafficHistoryRepository implements ICrud<UserTrafficHistoryEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly converter: UserTrafficHistoryConverter,
    ) {}

    public async create(entity: UserTrafficHistoryEntity): Promise<UserTrafficHistoryEntity> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.userTrafficHistory.create({
            data: model,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByUUID(uuid: string): Promise<null | UserTrafficHistoryEntity> {
        const result = await this.prisma.tx.userTrafficHistory.findUnique({
            where: { uuid },
        });
        if (!result) {
            return null;
        }
        return this.converter.fromPrismaModelToEntity(result);
    }

    public async update({
        uuid,
        ...data
    }: Partial<UserTrafficHistoryEntity>): Promise<UserTrafficHistoryEntity> {
        const result = await this.prisma.tx.userTrafficHistory.update({
            where: {
                uuid,
            },
            data,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(
        dto: Partial<UserTrafficHistoryEntity>,
    ): Promise<UserTrafficHistoryEntity[]> {
        const list = await this.prisma.tx.userTrafficHistory.findMany({
            where: dto,
        });
        return this.converter.fromPrismaModelsToEntities(list);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.userTrafficHistory.delete({ where: { uuid } });
        return !!result;
    }
}
