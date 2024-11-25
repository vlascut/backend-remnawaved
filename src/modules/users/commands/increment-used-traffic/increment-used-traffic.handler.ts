import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Transactional } from '@nestjs-cls/transactional';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../repositories/users.repository';
import { IncrementUsedTrafficCommand } from './increment-used-traffic.command';

@CommandHandler(IncrementUsedTrafficCommand)
export class IncrementUsedTrafficHandler
    implements ICommandHandler<IncrementUsedTrafficCommand, ICommandResponse<void>>
{
    public readonly logger = new Logger(IncrementUsedTrafficHandler.name);

    constructor(private readonly usersRepository: UsersRepository) {}

    @Transactional()
    async execute(command: IncrementUsedTrafficCommand): Promise<ICommandResponse<void>> {
        try {
            await this.usersRepository.incrementUsedTraffic(command.userUuid, command.bytes);

            return {
                isOk: true,
            };
        } catch (error: unknown) {
            this.logger.error(`Error: ${JSON.stringify(error)}`);
            return {
                isOk: false,
                ...ERRORS.INCREMENT_USED_TRAFFIC_ERROR,
            };
        }
    }
}
