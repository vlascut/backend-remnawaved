import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Logger } from '@nestjs/common';
import { GetPreparedConfigWithUsersQuery } from './get-prepared-config-with-users.query';
import { IXrayConfig } from '../../../../common/helpers/xray-config/interfaces';
import { XrayConfigService } from '../../xray-config.service';
import { GetUsersForConfigQuery } from '../../../users/queries/get-users-for-config';
import { UserForConfigEntity } from '../../../users/entities/users-for-config';

@QueryHandler(GetPreparedConfigWithUsersQuery)
export class GetPreparedConfigWithUsersHandler
    implements IQueryHandler<GetPreparedConfigWithUsersQuery, ICommandResponse<IXrayConfig>>
{
    private readonly logger = new Logger(GetPreparedConfigWithUsersHandler.name);
    constructor(
        private readonly xrayService: XrayConfigService,
        private readonly queryBus: QueryBus,
    ) {}

    async execute(): Promise<ICommandResponse<IXrayConfig>> {
        try {
            const users = await this.getUsersForConfig();

            if (!users.isOk || !users.response) {
                throw new Error('Failed to get users for config');
            }

            const config = await this.xrayService.getConfigWithUsers(users.response);
            this.logger.log(JSON.stringify(config.response, null, 2));
            return {
                isOk: true,
                response: config.response,
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
