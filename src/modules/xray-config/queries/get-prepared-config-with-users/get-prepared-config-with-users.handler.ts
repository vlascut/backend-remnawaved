import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { XRayConfig } from '@common/helpers/xray-config/xray-config.validator';
import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { ERRORS } from '@libs/contracts/constants';

import { XrayConfigRepository } from '@modules/xray-config/repositories/xray-config.repository';
import { UsersRepository } from '@modules/users/repositories/users.repository';

import { GetPreparedConfigWithUsersQuery } from './get-prepared-config-with-users.query';

@QueryHandler(GetPreparedConfigWithUsersQuery)
export class GetPreparedConfigWithUsersHandler
    implements IQueryHandler<GetPreparedConfigWithUsersQuery, ICommandResponse<IXrayConfig>>
{
    private readonly logger = new Logger(GetPreparedConfigWithUsersHandler.name);
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly xrayConfigRepository: XrayConfigRepository,
    ) {}

    async execute(query: GetPreparedConfigWithUsersQuery): Promise<ICommandResponse<IXrayConfig>> {
        let config: XRayConfig | null = null;
        try {
            const { excludedInbounds } = query;

            const dbConfig = await this.xrayConfigRepository.findFirst();

            if (!dbConfig || !dbConfig.config) {
                throw new Error('No XTLS config found in DB!');
            }

            config = new XRayConfig(dbConfig.config);
            config.excludeInbounds(excludedInbounds.map((inbound) => inbound.tag));

            config.processCertificates();

            const usersStream = this.usersRepository.getUsersForConfigStream(excludedInbounds);

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
