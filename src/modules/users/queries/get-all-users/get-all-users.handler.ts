import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Logger } from '@nestjs/common';
import { GetAllUsersQuery } from './get-all-users.query';
import { UsersRepository } from '../../repositories/users.repository';
import { UserWithActiveInboundsEntity } from '../../entities/user-with-active-inbounds.entity';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler
    implements IQueryHandler<GetAllUsersQuery, ICommandResponse<UserWithActiveInboundsEntity[]>>
{
    private readonly logger = new Logger(GetAllUsersHandler.name);
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(
        query: GetAllUsersQuery,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity[]>> {
        try {
            const users = await this.usersRepository.getAllUsersWithActiveInbounds();

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
