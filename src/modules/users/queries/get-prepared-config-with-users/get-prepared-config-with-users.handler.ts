import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { HashedSet } from '@remnawave/hashed-set';

import { XRayConfig } from '@common/helpers/xray-config/xray-config.validator';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';

import { GetConfigProfileByUuidQuery } from '@modules/config-profiles/queries/get-config-profile-by-uuid';
import { UsersRepository } from '@modules/users/repositories/users.repository';

import {
    GetPreparedConfigWithUsersQuery,
    IGetPreparedConfigWithUsersResponse,
} from './get-prepared-config-with-users.query';

@QueryHandler(GetPreparedConfigWithUsersQuery)
export class GetPreparedConfigWithUsersHandler
    implements
        IQueryHandler<
            GetPreparedConfigWithUsersQuery,
            ICommandResponse<IGetPreparedConfigWithUsersResponse>
        >
{
    private readonly logger = new Logger(GetPreparedConfigWithUsersHandler.name);
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly queryBus: QueryBus,
    ) {}

    async execute(
        query: GetPreparedConfigWithUsersQuery,
    ): Promise<ICommandResponse<IGetPreparedConfigWithUsersResponse>> {
        let config: XRayConfig | null = null;
        const inboundsEmailSets: Map<string, HashedSet> = new Map();
        try {
            // TODO: cleanup logs
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

            const start = Date.now();
            const configHash = config.getConfigHash();
            this.logger.log(`Config hash: ${configHash} in ${Date.now() - start}ms`);

            const usersStream = this.usersRepository.getUsersForConfigStream(
                configProfileUuid,
                activeInbounds,
            );

            const startUserBatch = Date.now();
            for await (const userBatch of usersStream) {
                config.includeUserBatch(userBatch, inboundsEmailSets);
            }
            const endUserBatch = Date.now();
            this.logger.log(`User batch in ${endUserBatch - startUserBatch}ms`);

            for (const [tag, set] of inboundsEmailSets) {
                this.logger.log(`Inbound ${tag} has ${set.size} users`);
            }

            for (const [tag, set] of inboundsEmailSets) {
                this.logger.log(`Inbound ${tag} has ${set.hash64String}...`);
            }

            return {
                isOk: true,
                response: {
                    config: config.getConfig(),
                    hashes: {
                        emptyConfig: configHash,
                        inbounds: Array.from(inboundsEmailSets.entries()).map(([tag, set]) => ({
                            usersCount: set.size,
                            hash: set.hash64String,
                            tag,
                        })),
                    },
                },
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        } finally {
            config = null;
            for (const [, set] of inboundsEmailSets) {
                set.clear();
            }
            inboundsEmailSets.clear();
        }
    }
}
