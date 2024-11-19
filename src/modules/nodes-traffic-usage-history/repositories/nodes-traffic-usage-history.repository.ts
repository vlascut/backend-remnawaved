import { Injectable } from '@nestjs/common';
import { NodesTrafficUsageHistoryEntity } from '../entities/nodes-traffic-usage-history.entity';
import { ICrud } from '@common/types/crud-port';
import { NodesTrafficUsageHistoryConverter } from '../nodes-traffic-usage-history.converter';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';

@Injectable()
export class NodesTrafficUsageHistoryRepository implements ICrud<NodesTrafficUsageHistoryEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly converter: NodesTrafficUsageHistoryConverter,
    ) {}

    public async create(
        entity: NodesTrafficUsageHistoryEntity,
    ): Promise<NodesTrafficUsageHistoryEntity> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.nodesTrafficUsageHistory.create({
            data: model,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByUUID(uuid: string): Promise<NodesTrafficUsageHistoryEntity | null> {
        const result = await this.prisma.tx.nodesTrafficUsageHistory.findUnique({
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
    }: Partial<NodesTrafficUsageHistoryEntity>): Promise<NodesTrafficUsageHistoryEntity> {
        const result = await this.prisma.tx.nodesTrafficUsageHistory.update({
            where: {
                uuid,
            },
            data,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(
        dto: Partial<NodesTrafficUsageHistoryEntity>,
    ): Promise<NodesTrafficUsageHistoryEntity[]> {
        const list = await this.prisma.tx.nodesTrafficUsageHistory.findMany({
            where: dto,
        });
        return this.converter.fromPrismaModelsToEntities(list);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.nodesTrafficUsageHistory.delete({ where: { uuid } });
        return !!result;
    }
}
