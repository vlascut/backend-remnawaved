import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { isDevelopment } from '@common/utils/startup-app';
import { XRayConfig } from '@common/helpers/xray-config';
import { ERRORS } from '@contract/constants';

import { InboundsWithTagsAndType } from '../inbounds/interfaces/inboubds-with-tags-and-type.interface';
import { DeleteManyInboundsCommand } from '../inbounds/commands/delete-many-inbounds';
import { CreateManyInboundsCommand } from '../inbounds/commands/create-many-inbounds';
import { XrayConfigRepository } from './repositories/xray-config.repository';
import { GetAllInboundsQuery } from '../inbounds/queries/get-all-inbounds';
import { UserForConfigEntity } from '../users/entities/users-for-config';
import { InboundsEntity } from '../inbounds/entities/inbounds.entity';
import { StartAllNodesEvent } from '../nodes/events/start-all-nodes';
import { UpdateConfigRequestDto } from './dtos/update-config.dto';
import { XrayConfigEntity } from './entities/xray-config.entity';

@Injectable()
export class XrayConfigService {
    private readonly logger = new Logger(XrayConfigService.name);
    private readonly configPath: string;

    constructor(
        private readonly xrayConfigRepository: XrayConfigRepository,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
    ) {
        this.configPath = isDevelopment()
            ? path.join(__dirname, '../../../../configs/xray/config/xray_config.json')
            : path.join('/var/lib/remnawave/configs/xray/config/xray_config.json');
    }

    public async updateConfig(config: object): Promise<ICommandResponse<XrayConfigEntity>> {
        try {
            const existingConfig = await this.xrayConfigRepository.findFirst();
            if (!existingConfig) {
                return await this.createConfig(config);
            }

            const result = await this.xrayConfigRepository.update({
                uuid: existingConfig.uuid,
                config,
            });

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.UPDATE_CONFIG_ERROR,
            };
        }
    }

    public async updateConfigFromController(
        requestConfig: UpdateConfigRequestDto,
    ): Promise<ICommandResponse<XrayConfigEntity>> {
        try {
            const config = requestConfig;

            const existingConfig = await this.xrayConfigRepository.findFirst();
            if (!existingConfig) {
                return await this.createConfig(config);
            }

            const validatedConfig = new XRayConfig(config);
            const sortedConfig = validatedConfig.getSortedConfig();

            const result = await this.xrayConfigRepository.update({
                uuid: existingConfig.uuid,
                config: sortedConfig,
            });

            result.config = sortedConfig;

            await this.syncInbounds();

            this.eventBus.publish(new StartAllNodesEvent());

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.UPDATE_CONFIG_ERROR,
            };
        }
    }

    public async createConfig(config: object): Promise<ICommandResponse<XrayConfigEntity>> {
        try {
            const result = await this.xrayConfigRepository.create(new XrayConfigEntity(config));

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.CREATE_CONFIG_ERROR,
            };
        }
    }

    public async getConfig(): Promise<ICommandResponse<IXrayConfig>> {
        try {
            let config: object | string;
            const dbConfig = await this.xrayConfigRepository.findFirst();
            if (!dbConfig?.config) {
                config = await fs.readFile(this.configPath, 'utf-8');
            } else {
                config = dbConfig.config;
            }

            const validatedConfig = new XRayConfig(config);

            const writeDBConfig = await this.updateConfig(validatedConfig.getSortedConfig());
            if (!writeDBConfig.isOk) {
                throw new Error('Failed to write config to DB');
            }

            return {
                isOk: true,
                response: validatedConfig.getSortedConfig(),
            };
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to read config file: ${error.message}`);
            } else {
                this.logger.error(`Failed to read config file: ${error}`);
            }
            return {
                isOk: false,
                ...ERRORS.GET_CONFIG_ERROR,
            };
        }
    }

    public async getConfigInstance(): Promise<null | XRayConfig> {
        try {
            let config: object | string;
            const dbConfig = await this.xrayConfigRepository.findFirst();
            if (!dbConfig?.config) {
                config = await fs.readFile(this.configPath, 'utf-8');
            } else {
                config = dbConfig.config;
            }

            return XRayConfig.getXrayConfigInstance(config);
        } catch {
            return null;
        }
    }

    public async getConfigWithUsers(
        users: UserForConfigEntity[],
    ): Promise<ICommandResponse<IXrayConfig>> {
        try {
            const config = await this.getConfig();
            if (!config.response) {
                return {
                    isOk: false,
                    ...ERRORS.GET_CONFIG_ERROR,
                };
            }
            const parsedConf = new XRayConfig(config.response);
            const configWithUsers = parsedConf.prepareConfigForNode(users);
            return {
                isOk: true,
                response: configWithUsers,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.GET_CONFIG_WITH_USERS_ERROR,
            };
        }
    }

    public async syncInbounds(): Promise<void> {
        try {
            const config = await this.getConfig();

            if (!config.isOk || !config.response) {
                throw new Error('Failed to get config');
            }

            const parsedConf = new XRayConfig(config.response);
            const configInbounds = parsedConf.getAllInbounds();

            const existingInbounds = await this.getAllInbounds();
            if (!existingInbounds.isOk || !existingInbounds.response) {
                throw new Error('Failed to get existing inbounds');
            }

            const inboundsToRemove = existingInbounds.response.filter((existingInbound) => {
                const configInbound = configInbounds.find((ci) => ci.tag === existingInbound.tag);
                return !configInbound || configInbound.type !== existingInbound.type;
            });

            const inboundsToAdd = configInbounds.filter((configInbound) => {
                if (!existingInbounds.response) {
                    return false;
                }
                const existingInbound = existingInbounds.response.find(
                    (ei) => ei.tag === configInbound.tag,
                );
                return !existingInbound || existingInbound.type !== configInbound.type;
            });

            if (inboundsToRemove.length) {
                const tagsToRemove = inboundsToRemove.map((inbound) => inbound.tag);
                this.logger.log(`Removing inbounds: ${tagsToRemove.join(', ')}`);
                await this.deleteManyInbounds({
                    tags: tagsToRemove,
                });
            }

            if (inboundsToAdd.length) {
                this.logger.log(`Adding inbounds: ${inboundsToAdd.map((i) => i.tag).join(', ')}`);
                await this.createManyInbounds(inboundsToAdd);
            }

            this.logger.log('Inbounds synced successfully');
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error('Failed to sync inbounds:', error.message);
            } else {
                this.logger.error('Failed to sync inbounds:', error);
            }
            throw error;
        }
    }

    private async deleteManyInbounds(
        dto: DeleteManyInboundsCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<DeleteManyInboundsCommand, ICommandResponse<void>>(
            new DeleteManyInboundsCommand(dto.tags),
        );
    }

    private async createManyInbounds(
        inbounds: InboundsWithTagsAndType[],
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<CreateManyInboundsCommand, ICommandResponse<void>>(
            new CreateManyInboundsCommand(inbounds),
        );
    }

    private async getAllInbounds(): Promise<ICommandResponse<InboundsEntity[]>> {
        return this.queryBus.execute<GetAllInboundsQuery, ICommandResponse<InboundsEntity[]>>(
            new GetAllInboundsQuery(),
        );
    }
}
