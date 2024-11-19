import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Logger } from '@nestjs/common';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@contract/constants';
import { CreateManyInboundsCommand } from './create-many-inbounds.command';
import { InboundsRepository } from '../../repositories/inbounds.repository';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(CreateManyInboundsCommand)
export class CreateManyInboundsHandler
    implements ICommandHandler<CreateManyInboundsCommand, ICommandResponse<void>>
{
    public readonly logger = new Logger(CreateManyInboundsHandler.name);

    constructor(private readonly inboundsRepository: InboundsRepository) {}

    @Transactional()
    async execute(command: CreateManyInboundsCommand): Promise<ICommandResponse<void>> {
        try {
            await this.inboundsRepository.createMany(command.tags);
            return {
                isOk: true,
            };
        } catch (error: unknown) {
            this.logger.error(`Error: ${JSON.stringify(error)}`);
            return {
                isOk: false,
                ...ERRORS.CREATE_MANY_INBOUNDS_ERROR,
            };
        }
    }
}
