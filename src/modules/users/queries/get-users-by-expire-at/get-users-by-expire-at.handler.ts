import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';

import { UserEntity } from '@modules/users/entities/user.entity';

import { GetUsersByExpireAtQuery } from './get-users-by-expire-at.query';
import { UsersRepository } from '../../repositories/users.repository';

@QueryHandler(GetUsersByExpireAtQuery)
export class GetUsersByExpireAtHandler
    implements IQueryHandler<GetUsersByExpireAtQuery, ICommandResponse<UserEntity[]>>
{
    private readonly logger = new Logger(GetUsersByExpireAtHandler.name);
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(query: GetUsersByExpireAtQuery): Promise<ICommandResponse<UserEntity[]>> {
        try {
            const users = await this.usersRepository.findUsersByExpireAt(query.start, query.end);

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
