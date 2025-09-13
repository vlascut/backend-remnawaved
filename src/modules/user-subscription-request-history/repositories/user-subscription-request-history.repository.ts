import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { ICrudWithId } from '@common/types/crud-port';

import { UserSubscriptionRequestHistoryEntity } from '../entities/user-subscription-request-history.entity';
import { UserSubscriptionRequestHistoryConverter } from '../user-subscription-request-history.converter';

@Injectable()
export class UserSubscriptionRequestHistoryRepository
    implements ICrudWithId<UserSubscriptionRequestHistoryEntity>
{
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly converter: UserSubscriptionRequestHistoryConverter,
    ) {}

    public async create(
        entity: UserSubscriptionRequestHistoryEntity,
    ): Promise<UserSubscriptionRequestHistoryEntity> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.userSubscriptionRequestHistory.create({
            data: model,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(
        dto: Partial<UserSubscriptionRequestHistoryEntity>,
    ): Promise<UserSubscriptionRequestHistoryEntity[]> {
        const list = await this.prisma.tx.userSubscriptionRequestHistory.findMany({
            where: dto,
        });
        return this.converter.fromPrismaModelsToEntities(list);
    }

    public async findById(
        id: bigint | number,
    ): Promise<UserSubscriptionRequestHistoryEntity | null> {
        const result = await this.prisma.tx.userSubscriptionRequestHistory.findUnique({
            where: { id },
        });
        if (!result) {
            return null;
        }

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async update(
        entity: UserSubscriptionRequestHistoryEntity,
    ): Promise<UserSubscriptionRequestHistoryEntity | null> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.userSubscriptionRequestHistory.update({
            where: { id: entity.id },
            data: model,
        });
        return this.converter.fromPrismaModelToEntity(result);
    }

    public async deleteById(id: bigint | number): Promise<boolean> {
        const result = await this.prisma.tx.userSubscriptionRequestHistory.delete({
            where: { id },
        });
        return !!result;
    }

    public async countByUserUuid(userUuid: string): Promise<number> {
        const result = await this.prisma.tx.userSubscriptionRequestHistory.count({
            where: { userUuid },
        });
        return result;
    }

    public async findOldestByUserUuid(
        userUuid: string,
    ): Promise<UserSubscriptionRequestHistoryEntity | null> {
        const result = await this.prisma.tx.userSubscriptionRequestHistory.findFirst({
            where: { userUuid },
            orderBy: { requestAt: 'asc' },
        });
        return result ? this.converter.fromPrismaModelToEntity(result) : null;
    }

    public async findByUserUuid(userUuid: string): Promise<UserSubscriptionRequestHistoryEntity[]> {
        const result = await this.prisma.tx.userSubscriptionRequestHistory.findMany({
            where: { userUuid },
            orderBy: { requestAt: 'desc' },
        });
        return this.converter.fromPrismaModelsToEntities(result);
    }
}
