import { Injectable, Logger } from '@nestjs/common';
import { XrayConfigRepository } from './repositories/xray-config.repository';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@contract/constants';
import { XrayConfigEntity } from './entities/xray-config.entity';
import { ConfigService } from '@nestjs/config';
import { DeleteManyInboundsCommand } from '../inbounds/commands/delete-many-inbounds';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateManyInboundsCommand } from '../inbounds/commands/create-many-inbounds';
import { InboundsEntity } from '../inbounds/entities/inbounds.entity';
import { GetAllInboundsQuery } from '../inbounds/queries/get-all-inbounds';
import { XRayConfig } from '../../common/helpers/xray-config';
import { IXrayConfig } from '../../common/helpers/xray-config/interfaces';

import path from 'path';
import fs from 'fs/promises';

@Injectable()
export class XrayConfigService {
    private readonly logger = new Logger(XrayConfigService.name);
    private readonly isDev: boolean;
    private readonly configPath: string;

    constructor(
        private readonly xrayConfigRepository: XrayConfigRepository,
        private readonly configService: ConfigService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
        this.isDev = this.configService.get('NODE_ENV') === 'development';
        this.configPath = this.isDev
            ? path.join(__dirname, '../../../../configs/xray/config/xray_config.json')
            : path.join('/var/lib/remnawave/configs/xray/config/xray_config.json');
    }

    public async updateConfig(config: object): Promise<ICommandResponse<XrayConfigEntity>> {
        try {
            const existingConfig = await this.xrayConfigRepository.findFirst();
            if (!existingConfig) {
                return {
                    isOk: false,
                    ...ERRORS.CONFIG_NOT_FOUND,
                };
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

    // public async getConfig(): Promise<ICommandResponse<XrayConfigEntity>> {
    //     try {
    //         const config = await this.xrayConfigRepository.findFirst();
    //         if (!config) {
    //             return {
    //                 isOk: false,
    //                 ...ERRORS.CONFIG_NOT_FOUND,
    //             };
    //         }

    //         return {
    //             isOk: true,
    //             response: config,
    //         };
    //     } catch (error) {
    //         this.logger.error(error);
    //         return {
    //             isOk: false,
    //             ...ERRORS.GET_CONFIG_ERROR,
    //         };
    //     }
    // }

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

    public async syncInbounds(): Promise<void> {
        try {
            const config = await this.getConfig();

            if (!config.isOk || !config.response) {
                throw new Error('Failed to get config');
            }

            const parsedConf = new XRayConfig(config.response);

            // const users: UserWithSettings[] = [
            //     {
            //         username: 'test',
            //         password: 'test',
            //         tag: 'Rex',
            //     },
            // ];

            // const configWithUsers = parsedConf.prepareConfigForNode(users);
            // this.logger.debug(JSON.stringify(configWithUsers, null, 2));

            const configTags = parsedConf.getAllTags();

            const existingInbounds = await this.getAllInbounds();
            if (!existingInbounds.isOk || !existingInbounds.response) {
                throw new Error('Failed to get existing inbounds');
            }
            const existingTags = existingInbounds.response.map((inbound) => inbound.tag);

            const tagsToRemove = existingTags.filter((tag) => !configTags.includes(tag));
            const tagsToAdd = configTags.filter((tag) => !existingTags.includes(tag));

            if (tagsToRemove.length > 0) {
                this.logger.log(`Removing inbounds: ${tagsToRemove.join(', ')}`);
                await this.deleteManyInbounds(tagsToRemove);
            }

            if (tagsToAdd.length > 0) {
                this.logger.log(`Adding inbounds: ${tagsToAdd.join(', ')}`);
                await this.createManyInbounds(tagsToAdd);
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

    // private async syncInbounds(config: { inbounds?: { tag: string }[] }): Promise<void> {
    //     try {
    //         const configTags = config.inbounds?.map((inbound) => inbound.tag) || [];

    //         const existingInbounds = await this.getAllInbounds();
    //         if (!existingInbounds.isOk || !existingInbounds.response) {
    //             throw new Error('Failed to get existing inbounds');
    //         }
    //         const existingTags = existingInbounds.response.map((inbound) => inbound.tag);

    //         const tagsToRemove = existingTags.filter((tag) => !configTags.includes(tag));
    //         const tagsToAdd = configTags.filter((tag) => !existingTags.includes(tag));

    //         if (tagsToRemove.length > 0) {
    //             this.logger.log(`Removing inbounds: ${tagsToRemove.join(', ')}`);
    //             await this.deleteManyInbounds(tagsToRemove);
    //         }

    //         if (tagsToAdd.length > 0) {
    //             this.logger.log(`Adding inbounds: ${tagsToAdd.join(', ')}`);
    //             await this.createManyInbounds(tagsToAdd);
    //         }

    //         this.logger.log('Inbounds synced successfully');
    //     } catch (error) {
    //         this.logger.error('Failed to sync inbounds:', error);
    //         throw error;
    //     }
    // }

    private async deleteManyInbounds(tags: string[]): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<DeleteManyInboundsCommand, ICommandResponse<void>>(
            new DeleteManyInboundsCommand(tags),
        );
    }

    private async createManyInbounds(tags: string[]): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<CreateManyInboundsCommand, ICommandResponse<void>>(
            new CreateManyInboundsCommand(tags),
        );
    }

    private async getAllInbounds(): Promise<ICommandResponse<InboundsEntity[]>> {
        return this.queryBus.execute<GetAllInboundsQuery, ICommandResponse<InboundsEntity[]>>(
            new GetAllInboundsQuery(),
        );
    }
}
