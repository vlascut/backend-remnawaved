import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ICommandResponse } from '../../common/types/command-response.type';
import { UserWithActiveInboundsEntity } from '../users/entities/user-with-active-inbounds.entity';
import { GetUserByShortUuidQuery } from '../users/queries/get-user-by-short-uuid';
import { HostWithInboundTagEntity } from '../hosts/entities/host-with-inbound-tag.entity';
import { GetHostsForUserQuery } from '../hosts/queries/get-hosts-for-user';
import { GetValidatedConfigQuery } from '../xray-config/queries/get-validated-config';
import { XRayConfig } from '../../common/helpers/xray-config';
import { generateSubscription } from './generators/generate-subscription';
import { getSubscriptionUserInfo } from './utils/get-user-info.headers';
import { UpdateSubLastOpenedAndUserAgentCommand } from '../users/commands/update-sub-last-opened-and-user-agent';
import { ConfigService } from '@nestjs/config';
import {
    SubscriptionRawResponse,
    SubscriptionNotFoundResponse,
    SubscriptionWithConfigResponse,
} from './models';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { USERS_STATUS } from '../../../libs/contract';
import { ISubscriptionHeaders } from './interfaces/subscription-headers.interface';

@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name);

    constructor(
        private readonly queryBus: QueryBus,
        private readonly configService: ConfigService,
        private readonly commandBus: CommandBus,
    ) {}

    public async getSubscriptionByShortUuid(
        shortUuid: string,
        userAgent: string,
        isHtml: boolean,
    ): Promise<
        SubscriptionRawResponse | SubscriptionNotFoundResponse | SubscriptionWithConfigResponse
    > {
        try {
            const user = await this.getUserByShortUuid({ shortUuid });
            if (!user.isOk || !user.response) {
                return new SubscriptionNotFoundResponse();
            }

            if (isHtml) {
                return this.getUserInfo(user.response);
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
            });

            return new SubscriptionWithConfigResponse({
                headers: await this.getUserProfileHeadersInfo(user.response),
                body: subscription.sub,
                contentType: subscription.contentType,
            });
        } catch (error) {
            return new SubscriptionNotFoundResponse();
        }
    }

    private async getUserInfo(
        user: UserWithActiveInboundsEntity,
    ): Promise<SubscriptionRawResponse> {
        return new SubscriptionRawResponse({
            isFound: true,
            user: {
                shortUuid: user.shortUuid,
                daysLeft: dayjs(user.expireAt).diff(dayjs(), 'day'),
                trafficUsed: prettyBytes(Number(user.usedTrafficBytes)),
                trafficLimit: prettyBytes(Number(user.trafficLimitBytes)),
                username: user.username,
                expiresAt: user.expireAt,
                isActive: user.status === USERS_STATUS.ACTIVE,
                userStatus: user.status,
            },
        });
    }

    private async getUserProfileHeadersInfo(
        user: UserWithActiveInboundsEntity,
    ): Promise<ISubscriptionHeaders> {
        return {
            'content-disposition': `attachment; filename="${user.username}"`,
            'profile-web-page-url': this.configService.getOrThrow('SUB_WEBPAGE_URL'),
            'support-url': this.configService.getOrThrow('SUB_SUPPORT_URL'),
            'profile-title': Buffer.from(
                this.configService.getOrThrow('SUB_PROFILE_TITLE'),
            ).toString('base64'),
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

    private async getValidatedConfig(): Promise<XRayConfig | null> {
        return this.queryBus.execute<GetValidatedConfigQuery, XRayConfig | null>(
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
