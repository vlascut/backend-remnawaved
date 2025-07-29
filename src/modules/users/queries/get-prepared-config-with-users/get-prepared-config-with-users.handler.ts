import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { XRayConfig } from '@common/helpers/xray-config/xray-config.validator';
import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { ERRORS } from '@libs/contracts/constants';

import { GetConfigProfileByUuidQuery } from '@modules/config-profiles/queries/get-config-profile-by-uuid';
import { UsersRepository } from '@modules/users/repositories/users.repository';

import { GetPreparedConfigWithUsersQuery } from './get-prepared-config-with-users.query';

@QueryHandler(GetPreparedConfigWithUsersQuery)
export class GetPreparedConfigWithUsersHandler
    implements IQueryHandler<GetPreparedConfigWithUsersQuery, ICommandResponse<IXrayConfig>>
{
    private readonly logger = new Logger(GetPreparedConfigWithUsersHandler.name);
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly queryBus: QueryBus,
    ) {}

    async execute(query: GetPreparedConfigWithUsersQuery): Promise<ICommandResponse<IXrayConfig>> {
        let config: XRayConfig | null = null;
        try {
            const { configProfileUuid, activeInbounds } = query;

            const configProfile = await this.queryBus.execute(
                new GetConfigProfileByUuidQuery(configProfileUuid),
            );

            if (!configProfile.isOk || !configProfile.response) {
                return {
                    isOk: false,
                    ...ERRORS.INTERNAL_SERVER_ERROR,
                };
            }

            config = new XRayConfig(configProfile.response.config as object);

            config.leaveInbounds(activeInbounds.map((inbound) => inbound.tag));

            config.processCertificates();

            const usersStream = this.usersRepository.getUsersForConfigStream(
                configProfileUuid,
                activeInbounds,
            );

            for await (const userBatch of usersStream) {
                config.includeUserBatch(userBatch);
            }

            return {
                isOk: true,
                response: config.getConfig(),
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        } finally {
            config = null;
        }
    }
}
