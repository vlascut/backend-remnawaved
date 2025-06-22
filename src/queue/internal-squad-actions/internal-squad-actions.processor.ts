import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { InternalSquadBulkActionsCommand } from '@modules/internal-squads/commands/internal-squad-bulk-actions/internal-squad-bulk-actions.command';

import { InternalSquadActionsJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(QueueNames.internalSquadActions, {
    concurrency: 1,
})
export class InternalSquadActionsQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(InternalSquadActionsQueueProcessor.name);

    constructor(private readonly commandBus: CommandBus) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case InternalSquadActionsJobNames.addUsersToInternalSquad:
                return this.handleAddUsersToInternalSquad(job);
            case InternalSquadActionsJobNames.removeUsersFromInternalSquad:
                return this.handleRemoveUsersFromInternalSquad(job);
            default:
                this.logger.warn(`Job "${job.name}" is not handled.`);
                break;
        }
    }

    private async handleAddUsersToInternalSquad(job: Job) {
        try {
            const { internalSquadUuid } = job.data;

            const result = await this.commandBus.execute(
                new InternalSquadBulkActionsCommand(internalSquadUuid, 'add'),
            );

            return result;
        } catch (error) {
            this.logger.error(
                `Error handling "${InternalSquadActionsJobNames.addUsersToInternalSquad}" job: ${error}`,
            );
        }
    }

    private async handleRemoveUsersFromInternalSquad(job: Job) {
        try {
            const { internalSquadUuid } = job.data;

            const result = await this.commandBus.execute(
                new InternalSquadBulkActionsCommand(internalSquadUuid, 'remove'),
            );

            return result;
        } catch (error) {
            this.logger.error(
                `Error handling "${InternalSquadActionsJobNames.removeUsersFromInternalSquad}" job: ${error}`,
            );
        }
    }
}
