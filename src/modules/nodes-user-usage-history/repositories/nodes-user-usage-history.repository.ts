import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { ICrud } from '@common/types/crud-port';

import { NodesUserUsageHistoryEntity } from '../entities/nodes-user-usage-history.entity';
import { NodesUserUsageHistoryConverter } from '../nodes-user-usage-history.converter';
import { ILastConnectedNode } from '../interfaces';

@Injectable()
export class NodesUserUsageHistoryRepository implements ICrud<NodesUserUsageHistoryEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly converter: NodesUserUsageHistoryConverter,
    ) {}

    public async create(entity: NodesUserUsageHistoryEntity): Promise<NodesUserUsageHistoryEntity> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.nodesUserUsageHistory.create({
            data: model,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async upsertUsageHistory(
        entity: NodesUserUsageHistoryEntity,
    ): Promise<NodesUserUsageHistoryEntity> {
        const model = this.converter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.nodesUserUsageHistory.upsert({
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
                nodeUuid_userUuid_createdAt: {
                    nodeUuid: entity.nodeUuid,
                    userUuid: entity.userUuid,
                    createdAt: entity.createdAt,
                },
            },
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByUUID(uuid: string): Promise<NodesUserUsageHistoryEntity | null> {
        const result = await this.prisma.tx.nodesUserUsageHistory.findUnique({
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
    }: Partial<NodesUserUsageHistoryEntity>): Promise<NodesUserUsageHistoryEntity> {
        const result = await this.prisma.tx.nodesUserUsageHistory.update({
            where: {
                uuid,
            },
            data,
        });

        return this.converter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(
        dto: Partial<NodesUserUsageHistoryEntity>,
    ): Promise<NodesUserUsageHistoryEntity[]> {
        const list = await this.prisma.tx.nodesUserUsageHistory.findMany({
            where: dto,
        });
        return this.converter.fromPrismaModelsToEntities(list);
    }

    public async getUserLastConnectedNode(userUuid: string): Promise<ILastConnectedNode | null> {
        const result = await this.prisma.tx.nodesUserUsageHistory.findFirst({
            where: { userUuid },
            orderBy: {
                updatedAt: 'desc',
            },
            include: {
                node: true,
            },
            take: 1,
        });
        if (!result) {
            return null;
        }
        return {
            nodeName: result.node.name,
            connectedAt: result.updatedAt,
        };
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.nodesUserUsageHistory.delete({ where: { uuid } });
        return !!result;
    }
}
