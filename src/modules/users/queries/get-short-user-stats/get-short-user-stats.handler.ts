import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Logger } from '@nestjs/common';
import { GetShortUserStatsQuery } from './get-short-user-stats.query';
import { UsersRepository } from '../../repositories/users.repository';
import { UserStats } from '../../interfaces/user-stats.interface';

@QueryHandler(GetShortUserStatsQuery)
export class GetShortUserStatsHandler
    implements IQueryHandler<GetShortUserStatsQuery, ICommandResponse<UserStats>>
{
    private readonly logger = new Logger(GetShortUserStatsHandler.name);
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(): Promise<ICommandResponse<UserStats>> {
        try {
            const users = await this.usersRepository.getUserStats();

            return {
                isOk: true,
                response: users,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
