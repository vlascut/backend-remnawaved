import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { GetAffectedConfigProfilesBySquadUuidQuery } from '@modules/internal-squads/queries/get-affected-config-profiles-by-squad-uuid/get-affected-config-profiles-by-squad-uuid.query';
import { InternalSquadBulkActionsCommand } from '@modules/internal-squads/commands/internal-squad-bulk-actions/internal-squad-bulk-actions.command';

import { StartAllNodesByProfileQueueService } from '@queue/start-all-nodes-by-profile/start-all-nodes-by-profile.service';

import { InternalSquadActionsJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(QueueNames.internalSquadActions, {
    concurrency: 1,
})
export class InternalSquadActionsQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(InternalSquadActionsQueueProcessor.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly startAllNodesByProfileQueueService: StartAllNodesByProfileQueueService,
    ) {
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

            await this.restartNodesByConfigProfiles(internalSquadUuid);

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

            await this.restartNodesByConfigProfiles(internalSquadUuid);

            return result;
        } catch (error) {
            this.logger.error(
                `Error handling "${InternalSquadActionsJobNames.removeUsersFromInternalSquad}" job: ${error}`,
            );
        }
    }

    private async restartNodesByConfigProfiles(internalSquadUuid: string): Promise<boolean> {
        try {
            const configProfiles = await this.commandBus.execute(
                new GetAffectedConfigProfilesBySquadUuidQuery(internalSquadUuid),
            );

            if (!configProfiles.isOk || !configProfiles.response) {
                return false;
            }

            const configProfilesUuids = configProfiles.response;

            if (configProfilesUuids.length === 0) {
                return false;
            }

            this.logger.log(
                `Restarting nodes by config profiles: ${JSON.stringify(configProfilesUuids)}`,
            );

            for (const configProfileUuid of configProfilesUuids) {
                await this.startAllNodesByProfileQueueService.startAllNodesByProfile({
                    profileUuid: configProfileUuid,
                    emitter: 'internal-squad-actions',
                });
            }

            return true;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }
}
