import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Logger } from '@nestjs/common';
import { GetUsersForConfigQuery } from './get-users-for-config.query';
import { UsersRepository } from '../../repositories/users.repository';
import { UserForConfigEntity } from '../../entities/users-for-config';

@QueryHandler(GetUsersForConfigQuery)
export class GetUsersForConfigHandler
    implements IQueryHandler<GetUsersForConfigQuery, ICommandResponse<UserForConfigEntity[]>>
{
    private readonly logger = new Logger(GetUsersForConfigHandler.name);
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(): Promise<ICommandResponse<UserForConfigEntity[]>> {
        try {
            const users = await this.usersRepository.getUsersForConfig();

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
