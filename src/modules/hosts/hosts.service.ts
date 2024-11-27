import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { CreateHostRequestDto } from './dtos/create-host.dto';
import { HostsEntity } from './entities/hosts.entity';
import { DeleteHostResponseModel } from './models/delete-host.response.model';
import { HostsRepository } from './repositories/hosts.repository';
import { ReorderHostRequestDto } from 'src/modules/hosts/dtos/reorder-hots.dto';

@Injectable()
export class HostsService {
    private readonly logger = new Logger(HostsService.name);
    constructor(
        private readonly hostsRepository: HostsRepository,

        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async createHost(dto: CreateHostRequestDto): Promise<ICommandResponse<HostsEntity>> {
        try {
            const hostEntity = new HostsEntity({
                ...dto,
            });

            const result = await this.hostsRepository.create(hostEntity);

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                error.meta?.modelName === 'Hosts' &&
                Array.isArray(error.meta.target)
            ) {
                const fields = error.meta.target as string[];
                if (fields.includes('remark')) {
                    return { isOk: false, ...ERRORS.HOST_REMARK_ALREADY_EXISTS };
                }
            }

            return { isOk: false, ...ERRORS.CREATE_HOST_ERROR };
        }
    }

    public async deleteHost(hostUuid: string): Promise<ICommandResponse<DeleteHostResponseModel>> {
        try {
            const host = await this.hostsRepository.findByUUID(hostUuid);
            if (!host) {
                return {
                    isOk: false,
                    ...ERRORS.HOST_NOT_FOUND,
                };
            }
            const result = await this.hostsRepository.deleteByUUID(host.uuid);

            return {
                isOk: true,
                response: new DeleteHostResponseModel({
                    isDeleted: result,
                }),
            };
        } catch (error) {
            this.logger.error(error);
            this.logger.error(JSON.stringify(error));
            return { isOk: false, ...ERRORS.DELETE_HOST_ERROR };
        }
    }

    public async getAllHosts(): Promise<ICommandResponse<HostsEntity[]>> {
        try {
            const result = await this.hostsRepository.findAll();

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return { isOk: false, ...ERRORS.GET_ALL_HOSTS_ERROR };
        }
    }

    public async reorderHosts(dto: ReorderHostRequestDto): Promise<
        ICommandResponse<{
            isUpdated: boolean;
        }>
    > {
        try {
            const result = await this.hostsRepository.reorderMany({
                ...dto.hosts,
            });

            return {
                isOk: true,
                response: {
                    isUpdated: result,
                },
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return { isOk: false, ...ERRORS.REORDER_HOSTS_ERROR };
        }
    }
}
