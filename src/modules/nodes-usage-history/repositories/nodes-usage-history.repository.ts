import { Injectable } from '@nestjs/common';
import { NodesUsageHistoryEntity } from '../entities/nodes-usage-history.entity';
import { ICrud } from '@common/types/crud-port';
import { NodesUsageHistoryConverter } from '../nodes-usage-history.converter';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';

@Injectable()
export class NodesUsageHistoryRepository implements ICrud<NodesUsageHistoryEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly converter: NodesUsageHistoryConverter,
    ) {}

    public async create(entity: NodesUsageHistoryEntity): Promise<NodesUsageHistoryEntity> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.nodesUsageHistory.create({
            data: model,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async upsertUsageHistory(
        entity: NodesUsageHistoryEntity,
    ): Promise<NodesUsageHistoryEntity> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.nodesUsageHistory.upsert({
            create: model,
            update: {
                downloadBytes: {
                    increment: model.downloadBytes,
                },
                uploadBytes: {
                    increment: model.uploadBytes,
                },
                totalBytes: {
                    increment: model.totalBytes,
                },
            },
            where: {
                nodeUuid_createdAt: {
                    nodeUuid: entity.nodeUuid,
                    createdAt: entity.createdAt,
                },
            },
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByUUID(uuid: string): Promise<NodesUsageHistoryEntity | null> {
        const result = await this.prisma.tx.nodesUsageHistory.findUnique({
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
    }: Partial<NodesUsageHistoryEntity>): Promise<NodesUsageHistoryEntity> {
        const result = await this.prisma.tx.nodesUsageHistory.update({
            where: {
                uuid,
            },
            data,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(
        dto: Partial<NodesUsageHistoryEntity>,
    ): Promise<NodesUsageHistoryEntity[]> {
        const list = await this.prisma.tx.nodesUsageHistory.findMany({
            where: dto,
        });
        return this.converter.fromPrismaModelsToEntities(list);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.nodesUsageHistory.delete({ where: { uuid } });
        return !!result;
    }
}
