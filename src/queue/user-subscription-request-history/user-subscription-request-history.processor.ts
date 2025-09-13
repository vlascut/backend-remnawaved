import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { CountAndDeleteSubscriptionRequestHistoryCommand } from '@modules/user-subscription-request-history/commands/count-and-delete-subscription-request-history';
import { CreateSubscriptionRequestHistoryCommand } from '@modules/user-subscription-request-history/commands/create-subscription-request-history';
import { UserSubscriptionRequestHistoryEntity } from '@modules/user-subscription-request-history';

import { IAddUserSubscriptionRequestHistoryPayload } from './interfaces';
import { UserSubscriptionRequestHistoryJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(QueueNames.userSubscriptionRequestHistory, {
    concurrency: 100,
})
export class UserSubscriptionRequestHistoryQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(UserSubscriptionRequestHistoryQueueProcessor.name);

    constructor(private readonly commandBus: CommandBus) {
        super();
    }

    async process(job: Job<IAddUserSubscriptionRequestHistoryPayload>) {
        switch (job.name) {
            case UserSubscriptionRequestHistoryJobNames.addRecord:
                return await this.handleAddRecordJob(job);
            default:
                this.logger.warn(`Job "${job.name}" is not handled.`);
                break;
        }
    }

    private async handleAddRecordJob(job: Job<IAddUserSubscriptionRequestHistoryPayload>) {
        try {
            const { userUuid, requestIp, userAgent, requestAt } = job.data;

            await this.commandBus.execute(
                new CreateSubscriptionRequestHistoryCommand(
                    new UserSubscriptionRequestHistoryEntity({
                        userUuid,
                        requestIp,
                        userAgent,
                        requestAt,
                    }),
                ),
            );

            await this.commandBus.execute(
                new CountAndDeleteSubscriptionRequestHistoryCommand(userUuid),
            );

            return {
                isOk: true,
            };
        } catch (error) {
            this.logger.error(error);

            return {
                isOk: false,
            };
        }
    }
}
