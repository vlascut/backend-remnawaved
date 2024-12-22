import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from '@nestjs-cls/transactional';
import { Logger } from '@nestjs/common';

import { ActiveUserInboundsRepository } from 'src/modules/inbounds/repositories/active-user-inbounds.repository';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@contract/constants';

import { DeleteManyActiveInboubdsByUserUuidCommand } from './delete-many-active-inboubds-by-user-uuid.command';

@CommandHandler(DeleteManyActiveInboubdsByUserUuidCommand)
export class DeleteManyActiveInboubdsByUserUuidHandler
    implements ICommandHandler<DeleteManyActiveInboubdsByUserUuidCommand, ICommandResponse<number>>
{
    public readonly logger = new Logger(DeleteManyActiveInboubdsByUserUuidHandler.name);

    constructor(private readonly activeUserInboundsRepository: ActiveUserInboundsRepository) {}

    @Transactional()
    async execute(
        command: DeleteManyActiveInboubdsByUserUuidCommand,
    ): Promise<ICommandResponse<number>> {
        try {
            const count = await this.activeUserInboundsRepository.deleteManyActiveByUserUuid(
                command.userUuid,
            );
            return {
                isOk: true,
                response: count,
            };
        } catch (error: unknown) {
            this.logger.error(`Error: ${JSON.stringify(error)}`);
            return {
                isOk: false,
                ...ERRORS.DELETE_MANY_INBOUNDS_ERROR,
            };
        }
    }
}
