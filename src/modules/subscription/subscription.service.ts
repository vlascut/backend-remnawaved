import dayjs from 'dayjs';

import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { prettyBytesUtil } from '@common/utils/bytes/pretty-bytes.util';
import { ICommandResponse } from '@common/types/command-response.type';
import { XRayConfig } from '@common/helpers/xray-config';
import { ERRORS, USERS_STATUS } from '@libs/contracts/constants';

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
import { FormattedHosts } from './generators/interfaces/formatted-hosts.interface';
import { GetUserByShortUuidQuery } from '../users/queries/get-user-by-short-uuid';
import { GetHostsForUserQuery } from '../hosts/queries/get-hosts-for-user';
import { generateSubscription } from './generators/generate-subscription';
import { getSubscriptionUserInfo } from './utils/get-user-info.headers';
import { XrayLinksGenerator } from './generators/by-subcription-type';
import { ConfigTemplatesService } from './config-templates.service';
import { FormatHosts } from './utils/format-hosts';

@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name);

    constructor(
        private readonly queryBus: QueryBus,
        private readonly configService: ConfigService,
        private readonly commandBus: CommandBus,
        private readonly configTemplatesService: ConfigTemplatesService,
    ) {}

    public async getSubscriptionByShortUuid(
        shortUuid: string,
        userAgent: string,
        isHtml: boolean,
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

            const subscription = generateSubscription({
                userAgent: userAgent,
                user: user.response,
                config,
                hosts: hosts.response,
                configService: this.configService,
                isOutlineConfig,
                encodedTag,
                configTemplatesService: this.configTemplatesService,
            });

            return new SubscriptionWithConfigResponse({
                headers: await this.getUserProfileHeadersInfo(user.response),
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

            const formattedHosts = FormatHosts.format(
                config,
                hosts.response || [],
                user.response,
                this.configService,
            );

            const xrayLinks = XrayLinksGenerator.generateLinks(formattedHosts);
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
        formattedHosts: FormattedHosts[],
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
    ): Promise<ISubscriptionHeaders> {
        return {
            'content-disposition': `attachment; filename="${user.username}"`,
            'profile-web-page-url': this.configService.getOrThrow('SUB_WEBPAGE_URL'),
            'support-url': this.configService.getOrThrow('SUB_SUPPORT_URL'),
            'profile-title': `base64:${Buffer.from(
                this.configService.getOrThrow('SUB_PROFILE_TITLE'),
            ).toString('base64')}`,
            'profile-update-interval': this.configService.getOrThrow('SUB_UPDATE_INTERVAL'),
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
