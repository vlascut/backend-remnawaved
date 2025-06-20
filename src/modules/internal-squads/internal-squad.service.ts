import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { Transactional } from '@nestjs-cls/transactional';
import { Injectable, Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants/errors';

import { StartAllNodesByProfileQueueService } from '@queue/start-all-nodes-by-profile';

import { GetInternalSquadByUuidResponseModel } from './models/get-internal-squad-by-uuid.response.model';
import { DeleteInternalSquadResponseModel } from './models/delete-internal-squad-by-uuid.response.model';
import { GetInternalSquadsResponseModel } from './models/get-internal-squads.response.model';
import { InternalSquadRepository } from './repositories/internal-squad.repository';
import { InternalSquadEntity } from './entities/internal-squad.entity';

@Injectable()
export class InternalSquadService {
    private readonly logger = new Logger(InternalSquadService.name);

    constructor(
        private readonly internalSquadRepository: InternalSquadRepository,
        private readonly startAllNodesByProfileQueueService: StartAllNodesByProfileQueueService,
    ) {}

    public async getInternalSquads(): Promise<ICommandResponse<GetInternalSquadsResponseModel>> {
        try {
            const internalSquads = await this.internalSquadRepository.getInternalSquads();

            return {
                isOk: true,
                response: new GetInternalSquadsResponseModel(internalSquads, internalSquads.length),
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.GET_INTERNAL_SQUADS_ERROR,
            };
        }
    }

    public async getInternalSquadsByUuid(
        uuid: string,
    ): Promise<ICommandResponse<GetInternalSquadByUuidResponseModel>> {
        try {
            const internalSquad = await this.internalSquadRepository.getInternalSquadsByUuid(uuid);

            if (!internalSquad) {
                return {
                    isOk: false,
                    ...ERRORS.INTERNAL_SQUAD_NOT_FOUND,
                };
            }

            return {
                isOk: true,
                response: new GetInternalSquadByUuidResponseModel(internalSquad),
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.GET_INTERNAL_SQUAD_BY_UUID_ERROR,
            };
        }
    }

    @Transactional()
    public async createInternalSquad(
        name: string,
        inbounds: string[],
    ): Promise<ICommandResponse<GetInternalSquadByUuidResponseModel>> {
        try {
            const internalSquad = await this.internalSquadRepository.create(
                new InternalSquadEntity({
                    name,
                }),
            );

            if (inbounds.length > 0) {
                await this.internalSquadRepository.createInbounds(inbounds, internalSquad.uuid);
            }

            return await this.getInternalSquadsByUuid(internalSquad.uuid);
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                error.meta?.modelName === 'InternalSquads' &&
                Array.isArray(error.meta.target)
            ) {
                const fields = error.meta.target as string[];
                if (fields.includes('name')) {
                    return { isOk: false, ...ERRORS.INTERNAL_SQUAD_NAME_ALREADY_EXISTS };
                }
            }

            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.CREATE_INTERNAL_SQUAD_ERROR,
            };
        }
    }

    @Transactional()
    public async updateInternalSquad(
        uuid: string,
        inbounds: string[],
    ): Promise<ICommandResponse<GetInternalSquadByUuidResponseModel>> {
        try {
            const internalSquad = await this.internalSquadRepository.findByUUID(uuid);

            if (!internalSquad) {
                return {
                    isOk: false,
                    ...ERRORS.INTERNAL_SQUAD_NOT_FOUND,
                };
            }

            await this.internalSquadRepository.cleanInbounds(internalSquad.uuid);

            if (inbounds.length > 0) {
                await this.internalSquadRepository.createInbounds(inbounds, internalSquad.uuid);
            }

            const result = await this.getInternalSquadsByUuid(internalSquad.uuid);

            const includedProfiles = new Set<string>();

            for (const inbound of result.response?.inbounds || []) {
                includedProfiles.add(inbound.profileUuid);
            }

            for (const profileUuid of includedProfiles) {
                await this.startAllNodesByProfileQueueService.startAllNodesByProfile({
                    profileUuid,
                    emitter: 'updateInternalSquad',
                });
            }

            return result;
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.UPDATE_INTERNAL_SQUAD_ERROR,
            };
        }
    }

    public async deleteInternalSquad(
        uuid: string,
    ): Promise<ICommandResponse<DeleteInternalSquadResponseModel>> {
        try {
            const internalSquad = await this.internalSquadRepository.getInternalSquadsByUuid(uuid);

            if (!internalSquad) {
                return {
                    isOk: false,
                    ...ERRORS.INTERNAL_SQUAD_NOT_FOUND,
                };
            }

            const includedProfiles = new Set<string>();

            for (const inbound of internalSquad.inbounds || []) {
                includedProfiles.add(inbound.profileUuid);
            }

            for (const profileUuid of includedProfiles) {
                await this.startAllNodesByProfileQueueService.startAllNodesByProfile({
                    profileUuid,
                    emitter: 'deleteInternalSquad',
                });
            }

            const deleted = await this.internalSquadRepository.deleteByUUID(uuid);

            return {
                isOk: true,
                response: new DeleteInternalSquadResponseModel(deleted),
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.DELETE_INTERNAL_SQUAD_ERROR,
            };
        }
    }
}
