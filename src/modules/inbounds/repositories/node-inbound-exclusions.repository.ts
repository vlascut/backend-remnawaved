import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { ICrud } from '@common/types/crud-port';

import { NodeInboundExclusionEntity } from '../entities';

@Injectable()
export class NodeInboundExclusionsRepository
    implements
        Omit<
            ICrud<NodeInboundExclusionEntity>,
            'create' | 'deleteByUUID' | 'findByCriteria' | 'findByUUID' | 'update'
        >
{
    constructor(private readonly prisma: TransactionHost<TransactionalAdapterPrisma>) {}

    @Transactional()
    public async setExcludedInbounds(nodeUuid: string, inboundUuids: string[]): Promise<number> {
        await this.prisma.tx.nodeInboundExclusions.deleteMany({
            where: {
                nodeUuid,
            },
        });

        if (inboundUuids.length > 0) {
            const result = await this.prisma.tx.nodeInboundExclusions.createMany({
                data: inboundUuids.map((inboundUuid) => ({ nodeUuid, inboundUuid })),
                skipDuplicates: true,
            });
            return result.count;
        }
        return 0;
    }
}
