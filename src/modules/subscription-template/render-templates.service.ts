import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { parseSingBoxVersion } from '@modules/subscription/utils/parse-sing-box-version';

import { SUBSCRIPTION_CONFIG_TYPES, TSubscriptionConfigTypes } from './constants/config-types';
import { OutlineGeneratorService } from './generators/outline.generator.service';
import { SingBoxGeneratorService } from './generators/singbox.generator.service';
import { MihomoGeneratorService } from './generators/mihomo.generator.service';
import { ClashGeneratorService } from './generators/clash.generator.service';
import { XrayGeneratorService } from './generators/xray.generator.service';
import { FormatHostsService } from './generators/format-hosts.service';
import { IGenerateSubscription } from './interfaces';

@Injectable()
export class RenderTemplatesService {
    constructor(
        private readonly configService: ConfigService,
        private readonly formatHostsService: FormatHostsService,
        private readonly mihomoGeneratorService: MihomoGeneratorService,
        private readonly clashGeneratorService: ClashGeneratorService,
        private readonly outlineGeneratorService: OutlineGeneratorService,
        private readonly xrayGeneratorService: XrayGeneratorService,
        private readonly singBoxGeneratorService: SingBoxGeneratorService,
    ) {}

    async generateSubscription(params: IGenerateSubscription): Promise<{
        contentType: string;
        sub: string;
    }> {
        const { userAgent, user, hosts, config, isOutlineConfig, encodedTag } = params;

        const configType = this.parseUserAgentType(userAgent);
        const configParams = SUBSCRIPTION_CONFIG_TYPES[configType];
        const formattedHosts = await this.formatHostsService.generateFormattedHosts(
            config,
            hosts,
            user,
        );

        if (isOutlineConfig) {
            return {
                contentType: 'application/json',
                sub: this.outlineGeneratorService.generateConfig(formattedHosts, encodedTag),
            };
        }

        switch (configType) {
            case 'XRAY':
                return {
                    sub: await this.xrayGeneratorService.generateConfig(
                        formattedHosts,
                        configParams.BASE64,
                    ),
                    contentType: configParams.CONTENT_TYPE,
                };

            case 'CLASH':
                return {
                    sub: await this.clashGeneratorService.generateConfig(formattedHosts, false),
                    contentType: configParams.CONTENT_TYPE,
                };

            case 'CLASH_META':
                return {
                    sub: await this.mihomoGeneratorService.generateConfig(formattedHosts, false),
                    contentType: configParams.CONTENT_TYPE,
                };

            case 'SING_BOX':
                return {
                    sub: await this.singBoxGeneratorService.generateConfig(
                        formattedHosts,
                        parseSingBoxVersion(userAgent),
                    ),
                    contentType: configParams.CONTENT_TYPE,
                };

            case 'STASH':
                return {
                    sub: await this.clashGeneratorService.generateConfig(formattedHosts, true),
                    contentType: configParams.CONTENT_TYPE,
                };

            case 'OUTLINE':
                return {
                    sub: this.outlineGeneratorService.generateConfig(formattedHosts),
                    contentType: configParams.CONTENT_TYPE,
                };

            default:
                return { sub: '', contentType: '' };
        }
    }

    private parseUserAgentType(userAgent: string): TSubscriptionConfigTypes {
        if (!userAgent) return 'XRAY';

        return (
            (Object.entries(SUBSCRIPTION_CONFIG_TYPES).find(
                ([configName, config]: [
                    string,
                    (typeof SUBSCRIPTION_CONFIG_TYPES)[keyof typeof SUBSCRIPTION_CONFIG_TYPES],
                ]) => configName !== 'XRAY' && config.REGEX?.test(userAgent),
            )?.[0] as TSubscriptionConfigTypes) || 'XRAY'
        );
    }
}
