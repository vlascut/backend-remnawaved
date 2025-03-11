import dayjs from 'dayjs';

import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { prettyBytesUtil } from '@common/utils/bytes/pretty-bytes.util';
import { ICommandResponse } from '@common/types/command-response.type';
import { XRayConfig } from '@common/helpers/xray-config';
import { ERRORS, USERS_STATUS } from '@libs/contracts/constants';

import { SubscriptionSettingsEntity } from '@modules/subscription-settings/entities/subscription-settings.entity';
import { GetSubscriptionSettingsQuery } from '@modules/subscription-settings/queries/get-subscription-settings';
import { XrayGeneratorService } from '@modules/subscription-template/generators/xray.generator.service';
import { FormatHostsService } from '@modules/subscription-template/generators/format-hosts.service';
import { RenderTemplatesService } from '@modules/subscription-template/render-templates.service';
import { IFormattedHost } from '@modules/subscription-template/generators/interfaces';

import {
    SubscriptionNotFoundResponse,
    SubscriptionRawResponse,
    SubscriptionWithConfigResponse,
} from './models';
import { UpdateSubLastOpenedAndUserAgentCommand } from '../users/commands/update-sub-last-opened-and-user-agent';
import { UserWithActiveInboundsEntity } from '../users/entities/user-with-active-inbounds.entity';
import { HostWithInboundTagEntity } from '../hosts/entities/host-with-inbound-tag.entity';
import { GetValidatedConfigQuery } from '../xray-config/queries/get-validated-config';
import { ISubscriptionHeaders } from './interfaces/subscription-headers.interface';
import { GetUserByShortUuidQuery } from '../users/queries/get-user-by-short-uuid';
import { GetHostsForUserQuery } from '../hosts/queries/get-hosts-for-user';
import { getSubscriptionUserInfo } from './utils/get-user-info.headers';

@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name);

    constructor(
        private readonly queryBus: QueryBus,
        private readonly configService: ConfigService,
        private readonly commandBus: CommandBus,
        private readonly renderTemplatesService: RenderTemplatesService,
        private readonly formatHostsService: FormatHostsService,
        private readonly xrayGeneratorService: XrayGeneratorService,
    ) {}

    public async getSubscriptionByShortUuid(
        shortUuid: string,
        userAgent: string,
        isHtml: boolean,
        needJsonSubscription: boolean = false,
        isOutlineConfig: boolean = false,
        encodedTag?: string,
    ): Promise<
        SubscriptionNotFoundResponse | SubscriptionRawResponse | SubscriptionWithConfigResponse
    > {
        try {
            const user = await this.getUserByShortUuid({ shortUuid });
            if (!user.isOk || !user.response) {
                return new SubscriptionNotFoundResponse();
            }

            if (isHtml) {
                const result = await this.getSubscriptionInfoByShortUuid(user.response.shortUuid);
                if (!result.isOk || !result.response) {
                    return new SubscriptionNotFoundResponse();
                }
                return result.response;
            }

            const hosts = await this.getHostsByUserUuid({ userUuid: user.response.uuid });

            if (!hosts.isOk || !hosts.response) {
                return new SubscriptionNotFoundResponse();
            }

            const config = await this.getValidatedConfig();
            if (!config) {
                return new SubscriptionNotFoundResponse();
            }

            await this.updateSubLastOpenedAndUserAgent({
                userUuid: user.response.uuid,
                subLastOpenedAt: new Date(),
                subLastUserAgent: userAgent,
            });

            const subscription = await this.renderTemplatesService.generateSubscription({
                userAgent: userAgent,
                user: user.response,
                config,
                hosts: hosts.response,
                isOutlineConfig,
                encodedTag,
                needJsonSubscription,
            });

            return new SubscriptionWithConfigResponse({
                headers: await this.getUserProfileHeadersInfo(
                    user.response,
                    /^Happ\//.test(userAgent),
                ),
                body: subscription.sub,
                contentType: subscription.contentType,
            });
        } catch {
            return new SubscriptionNotFoundResponse();
        }
    }

    public async getSubscriptionInfoByShortUuid(
        shortUuid: string,
    ): Promise<ICommandResponse<SubscriptionRawResponse>> {
        try {
            const user = await this.getUserByShortUuid({ shortUuid });
            if (!user.isOk || !user.response) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            const config = await this.getValidatedConfig();
            if (!config) {
                return {
                    isOk: false,
                    ...ERRORS.INTERNAL_SERVER_ERROR,
                };
            }

            const hosts = await this.getHostsByUserUuid({ userUuid: user.response.uuid });

            const formattedHosts = await this.formatHostsService.generateFormattedHosts(
                config,
                hosts.response || [],
                user.response,
            );

            const xrayLinks = this.xrayGeneratorService.generateLinks(formattedHosts);

            const ssConfLinks = await this.generateSsConfLinks(
                user.response.shortUuid,
                formattedHosts,
            );
            return {
                isOk: true,
                response: await this.getUserInfo(user.response, xrayLinks, ssConfLinks),
            };
        } catch (error) {
            this.logger.error(`Error getting subscription info by short uuid: ${error}`);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }

    private async getUserInfo(
        user: UserWithActiveInboundsEntity,
        links: string[],
        ssConfLinks: Record<string, string>,
    ): Promise<SubscriptionRawResponse> {
        return new SubscriptionRawResponse({
            isFound: true,
            user: {
                shortUuid: user.shortUuid,
                daysLeft: dayjs(user.expireAt).diff(dayjs(), 'day'),
                trafficUsed: prettyBytesUtil(user.usedTrafficBytes),
                trafficLimit: prettyBytesUtil(user.trafficLimitBytes),
                username: user.username,
                expiresAt: user.expireAt,
                isActive: user.status === USERS_STATUS.ACTIVE,
                userStatus: user.status,
                trafficLimitStrategy: user.trafficLimitStrategy,
            },
            links,
            ssConfLinks,
            subscriptionUrl: `https://${this.configService.getOrThrow('SUB_PUBLIC_DOMAIN')}/${user.shortUuid}#${user.username}`,
        });
    }

    private async generateSsConfLinks(
        subscriptionShortUuid: string,
        formattedHosts: IFormattedHost[],
    ): Promise<Record<string, string>> {
        const publicDomain = this.configService.getOrThrow('SUB_PUBLIC_DOMAIN');
        const links: Record<string, string> = {};

        for (const host of formattedHosts) {
            if (host.protocol !== 'shadowsocks' || host.port === 0 || host.port === 1) {
                continue;
            }

            links[host.remark] =
                `ssconf://${publicDomain}/${subscriptionShortUuid}/ss/${Buffer.from(
                    host.remark,
                ).toString('base64url')}#${host.remark}`;
        }

        return links;
    }

    private async getUserProfileHeadersInfo(
        user: UserWithActiveInboundsEntity,
        isHapp: boolean,
    ): Promise<ISubscriptionHeaders> {
        const settingsResponse = await this.getSubscriptionSettings();
        if (!settingsResponse.isOk || !settingsResponse.response) {
            return {
                'content-disposition': `attachment; filename="${user.username}"`,
                'profile-web-page-url': '',
                'support-url': '',
                'profile-title': '',
                'profile-update-interval': '24',
                'subscription-userinfo': '',
            };
        }

        const settings = settingsResponse.response;

        return {
            announce: isHapp
                ? `base64:${Buffer.from(settings.happAnnounce ?? '').toString('base64')}`
                : undefined,
            routing: isHapp ? (settings.happRouting ?? undefined) : undefined,
            'content-disposition': `attachment; filename="${user.username}"`,
            'profile-web-page-url': settings.profileWebpageUrl,
            'support-url': settings.supportLink,
            'profile-title': `base64:${Buffer.from(settings.profileTitle).toString('base64')}`,
            'profile-update-interval': settings.profileUpdateInterval.toString(),
            'subscription-userinfo': Object.entries(getSubscriptionUserInfo(user))
                .map(([key, val]) => `${key}=${val}`)
                .join('; '),
        };
    }

    private async getUserByShortUuid(
        dto: GetUserByShortUuidQuery,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        return this.queryBus.execute<
            GetUserByShortUuidQuery,
            ICommandResponse<UserWithActiveInboundsEntity>
        >(new GetUserByShortUuidQuery(dto.shortUuid));
    }

    private async getHostsByUserUuid(
        dto: GetHostsForUserQuery,
    ): Promise<ICommandResponse<HostWithInboundTagEntity[]>> {
        return this.queryBus.execute<
            GetHostsForUserQuery,
            ICommandResponse<HostWithInboundTagEntity[]>
        >(new GetHostsForUserQuery(dto.userUuid));
    }

    private async getValidatedConfig(): Promise<null | XRayConfig> {
        return this.queryBus.execute<GetValidatedConfigQuery, null | XRayConfig>(
            new GetValidatedConfigQuery(),
        );
    }

    private async getSubscriptionSettings(): Promise<ICommandResponse<SubscriptionSettingsEntity>> {
        return this.queryBus.execute<
            GetSubscriptionSettingsQuery,
            ICommandResponse<SubscriptionSettingsEntity>
        >(new GetSubscriptionSettingsQuery());
    }

    private async updateSubLastOpenedAndUserAgent(
        dto: UpdateSubLastOpenedAndUserAgentCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<
            UpdateSubLastOpenedAndUserAgentCommand,
            ICommandResponse<void>
        >(
            new UpdateSubLastOpenedAndUserAgentCommand(
                dto.userUuid,
                dto.subLastOpenedAt,
                dto.subLastUserAgent,
            ),
        );
    }
}
