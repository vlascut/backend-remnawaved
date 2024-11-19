import { Injectable, Logger } from '@nestjs/common';
import { XrayConfigRepository } from './repositories/xray-config.repository';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@contract/constants';
import { XrayConfigEntity } from './entities/xray-config.entity';
import path from 'path';
import fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class XrayConfigService {
    private readonly logger = new Logger(XrayConfigService.name);
    private readonly isDev: boolean;
    private readonly configPath: string;

    constructor(
        private readonly xrayConfigRepository: XrayConfigRepository,
        private readonly configService: ConfigService,
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

    public async getConfig(): Promise<object> {
        try {
            let config = {};
            const dbConfig = await this.xrayConfigRepository.findFirst();
            if (!dbConfig) {
                const configData = await fs.readFile(this.configPath, 'utf-8');
                config = JSON.parse(configData);
            } else {
                config = dbConfig.config as object;
            }
            return config;
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to read config file: ${error.message}`);
            } else {
                this.logger.error(`Failed to read config file: ${error}`);
            }
            throw error;
        }
    }
}
