import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { forwardRef, Inject, Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { ERRORS } from '@libs/contracts/constants';

import { GetPreparedConfigWithUsersQuery } from './get-prepared-config-with-users.query';
import { UserForConfigEntity } from '../../../users/entities/users-for-config';
import { UsersRepository } from '../../../users/repositories/users.repository';
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
        @Inject(forwardRef(() => UsersRepository))
        private readonly usersRepository: UsersRepository,
    ) {}

    async execute(query: GetPreparedConfigWithUsersQuery): Promise<ICommandResponse<IXrayConfig>> {
        try {
            const { excludedInbounds } = query;

            const usersGenerator = this.getUsersForConfigStream({
                excludedInbounds,
            });

            const config = await this.xrayService.getConfigWithUsers(usersGenerator);

            if (!config.response) {
                throw new Error('Config response is empty');
            }

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

    private getUsersForConfigStream(
        dto: GetPreparedConfigWithUsersQuery,
    ): AsyncGenerator<UserForConfigEntity[]> {
        return this.usersRepository.getUsersForConfigStream(dto.excludedInbounds);
    }
}
