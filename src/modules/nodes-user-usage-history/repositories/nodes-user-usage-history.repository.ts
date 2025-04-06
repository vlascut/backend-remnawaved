import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { ICrudHistoricalRecords } from '@common/types/crud-port';

import { IGetUserUsageByRange } from '@modules/users/interfaces';

import { BulkUpsertHistoryEntryBuilder } from '../builders/bulk-upsert-history-entry/bulk-upsert-history-entry.builder';
import { GetUserUsageByRangeBuilder } from '../builders/get-user-usage-by-range/get-user-usage-by-range.builder';
import { NodesUserUsageHistoryEntity } from '../entities/nodes-user-usage-history.entity';
import { NodesUserUsageHistoryConverter } from '../nodes-user-usage-history.converter';
import { ILastConnectedNode } from '../interfaces';

@Injectable()
export class NodesUserUsageHistoryRepository
    implements ICrudHistoricalRecords<NodesUserUsageHistoryEntity>
{
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

    public async bulkUpsertUsageHistory(
        userUsageHistoryList: NodesUserUsageHistoryEntity[],
    ): Promise<void> {
        const chunkSize = 4000;
        for (let i = 0; i < userUsageHistoryList.length; i += chunkSize) {
            const chunk = userUsageHistoryList.slice(i, i + chunkSize);
            const { query } = new BulkUpsertHistoryEntryBuilder(chunk);
            await this.prisma.tx.$executeRaw<void>(query);
        }
    }

    public async getUserUsageByRange(
        userUuid: string,
        start: Date,
        end: Date,
    ): Promise<IGetUserUsageByRange[]> {
        const { query } = new GetUserUsageByRangeBuilder(userUuid, start, end);
        const result = await this.prisma.tx.$queryRaw<IGetUserUsageByRange[]>(query);
        return result;
    }
}
