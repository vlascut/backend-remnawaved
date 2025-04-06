import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';

import { BulkIncrementUsedTrafficCommand } from '@modules/users/commands/bulk-increment-used-traffic';

import { UpdateUsersUsageJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(QueueNames.updateUsersUsage, {
    concurrency: 1,
})
export class UpdateUsersUsageQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(UpdateUsersUsageQueueProcessor.name);

    constructor(private readonly commandBus: CommandBus) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case UpdateUsersUsageJobNames.UpdateUsersUsage:
                return this.handleUpdateUsersUsage(job);
            default:
                this.logger.warn(`Job "${job.name}" is not handled.`);
                break;
        }
    }

    private async handleUpdateUsersUsage(job: Job<{ u: string; b: string }[]>) {
        try {
            const userUsageList = job.data;

            const result = await this.bulkIncrementUsedTraffic({
                userUsageList,
            });

            if (!result.isOk) {
                throw new Error(JSON.stringify(result));
            }

            return {
                affectedRows: result.response,
            };
        } catch (error) {
            this.logger.error(
                `Error handling "${UpdateUsersUsageJobNames.UpdateUsersUsage}" job: ${error}`,
            );

            throw new Error(`${error}`);
        }
    }

    private async bulkIncrementUsedTraffic(
        dto: BulkIncrementUsedTrafficCommand,
    ): Promise<ICommandResponse<number>> {
        return this.commandBus.execute<BulkIncrementUsedTrafficCommand, ICommandResponse<number>>(
            new BulkIncrementUsedTrafficCommand(dto.userUsageList),
        );
    }
}
