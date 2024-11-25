import { ICrud } from '@common/types/crud-port';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { HostWithInboundTagEntity } from '../entities/host-with-inbound-tag.entity';
import { HostsEntity } from '../entities/hosts.entity';
import { HostsConverter } from '../hosts.converter';

@Injectable()
export class HostsRepository implements ICrud<HostsEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly hostsConverter: HostsConverter,
    ) {}

    public async create(entity: HostsEntity): Promise<HostsEntity> {
        const model = this.hostsConverter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.hosts.create({
            data: model,
        });

        return this.hostsConverter.fromPrismaModelToEntity(result);
    }

    public async findByUUID(uuid: string): Promise<HostsEntity | null> {
        const result = await this.prisma.tx.hosts.findUnique({
            where: { uuid },
        });
        if (!result) {
            return null;
        }
        return this.hostsConverter.fromPrismaModelToEntity(result);
    }

    public async update({ uuid, ...data }: Partial<HostsEntity>): Promise<HostsEntity> {
        const result = await this.prisma.tx.hosts.update({
            where: {
                uuid,
            },
            data,
        });

        return this.hostsConverter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(dto: Partial<HostsEntity>): Promise<HostsEntity[]> {
        const list = await this.prisma.tx.hosts.findMany({
            where: dto,
        });
        return this.hostsConverter.fromPrismaModelsToEntities(list);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.hosts.delete({ where: { uuid } });
        return !!result;
    }

    public async findActiveHostsByUserUuid(userUuid: string): Promise<HostWithInboundTagEntity[]> {
        const list = await this.prisma.tx.hosts.findMany({
            where: {
                isDisabled: false,
                inboundTag: {
                    activeUserInbounds: {
                        some: {
                            userUuid,
                        },
                    },
                },
            },
            include: {
                inboundTag: true,
            },
            orderBy: {
                viewPosition: 'asc',
            },
        });

        return list.map(
            (host) =>
                new HostWithInboundTagEntity({
                    ...host,
                }),
        );
    }
}
