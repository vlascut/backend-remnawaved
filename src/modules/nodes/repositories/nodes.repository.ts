import { Injectable } from '@nestjs/common';
import { NodesEntity } from '../entities/nodes.entity';
import { ICrud } from '@common/types/crud-port';
import { NodesConverter } from '../nodes.converter';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';

@Injectable()
export class NodesRepository implements ICrud<NodesEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly nodesConverter: NodesConverter,
    ) {}

    public async create(entity: NodesEntity): Promise<NodesEntity> {
        const model = this.nodesConverter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.nodes.create({
            data: model,
        });

        return this.nodesConverter.fromPrismaModelToEntity(result);
    }

    public async findConnectedNodes(): Promise<NodesEntity[]> {
        const nodesList = await this.prisma.tx.nodes.findMany({
            where: {
                isConnected: true,
                isXrayRunning: true,
                isNodeOnline: true,
                isDisabled: false,
            },
        });
        return this.nodesConverter.fromPrismaModelsToEntities(nodesList);
    }

    public async findByUUID(uuid: string): Promise<NodesEntity | null> {
        const result = await this.prisma.tx.nodes.findUnique({
            where: { uuid },
        });
        if (!result) {
            return null;
        }
        return this.nodesConverter.fromPrismaModelToEntity(result);
    }

    public async update({ uuid, ...data }: Partial<NodesEntity>): Promise<NodesEntity> {
        const result = await this.prisma.tx.nodes.update({
            where: {
                uuid,
            },
            data,
        });

        return this.nodesConverter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(dto: Partial<NodesEntity>): Promise<NodesEntity[]> {
        const nodesList = await this.prisma.tx.nodes.findMany({
            where: dto,
        });
        return this.nodesConverter.fromPrismaModelsToEntities(nodesList);
    }

    public async findFirstByCriteria(dto: Partial<NodesEntity>): Promise<NodesEntity | null> {
        const result = await this.prisma.tx.nodes.findFirst({
            where: dto,
        });

        if (!result) {
            return null;
        }

        return this.nodesConverter.fromPrismaModelToEntity(result);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.nodes.delete({ where: { uuid } });
        return !!result;
    }
}
