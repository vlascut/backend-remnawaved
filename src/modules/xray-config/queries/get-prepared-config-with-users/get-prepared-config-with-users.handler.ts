import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { forwardRef, Inject, Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { ERRORS } from '@libs/contracts/constants';

import { GetPreparedConfigWithUsersQuery } from './get-prepared-config-with-users.query';
import { GetUsersForConfigQuery } from '../../../users/queries/get-users-for-config';
import { UserForConfigEntity } from '../../../users/entities/users-for-config';
import { XrayConfigService } from '../../xray-config.service';

@QueryHandler(GetPreparedConfigWithUsersQuery)
export class GetPreparedConfigWithUsersHandler
    implements IQueryHandler<GetPreparedConfigWithUsersQuery, ICommandResponse<IXrayConfig>>
{
    private readonly logger = new Logger(GetPreparedConfigWithUsersHandler.name);
    constructor(
        @Inject(forwardRef(() => XrayConfigService))
        private readonly xrayService: XrayConfigService,

        private readonly queryBus: QueryBus,
    ) {}

    async execute(query: GetPreparedConfigWithUsersQuery): Promise<ICommandResponse<IXrayConfig>> {
        try {
            const { excludedInbounds } = query;
            const excludedTags = new Set(excludedInbounds.map((inbound) => inbound.tag));

            const users = await this.getUsersForConfig();

            if (!users.isOk || !users.response) {
                throw new Error('Failed to get users for config');
            }

            const config = await this.xrayService.getConfigWithUsers(users.response);

            if (!config.response) {
                throw new Error('Config response is empty');
            }

            const filteredConfig: IXrayConfig = {
                ...config.response,
                inbounds: config.response.inbounds.filter(
                    (inbound) => !excludedTags.has(inbound.tag),
                ),
            };

            return {
                isOk: true,
                response: filteredConfig,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }

    private getUsersForConfig(): Promise<ICommandResponse<UserForConfigEntity[]>> {
        return this.queryBus.execute<
            GetUsersForConfigQuery,
            ICommandResponse<UserForConfigEntity[]>
        >(new GetUsersForConfigQuery());
    }
}
