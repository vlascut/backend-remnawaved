import { QueueEvents } from 'bullmq';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { sleep } from '@common/utils/sleep';

import { StartAllNodesByProfileQueueService } from './start-all-nodes-by-profile.service';
import { QueueNames } from '../queue.enum';

@Injectable()
export class StartAllNodesByProfileQueueEvents implements OnModuleInit {
    private readonly logger = new Logger(StartAllNodesByProfileQueueEvents.name);

    private queueEvents: QueueEvents;

    constructor(private readonly startAllNodesByProfileQueue: StartAllNodesByProfileQueueService) {}

    async onModuleInit() {
        this.queueEvents = new QueueEvents(QueueNames.startAllNodesByProfile, {
            connection: this.startAllNodesByProfileQueue.queue.opts.connection,
        });

        this.queueEvents.on('deduplicated', async (event) => {
            const { jobId, deduplicationId } = event;

            this.logger.log(`[deduplicated] ${deduplicationId} – retrying job ${jobId} in 10s`);

            await sleep(10_000);

            const profileUuid = deduplicationId;

            await this.startAllNodesByProfileQueue.startAllNodesByProfile({
                profileUuid,
                emitter: 'RetryStartAllNodesByProfile',
            });
        });
    }
}
