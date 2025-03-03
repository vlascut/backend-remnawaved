import { Job } from 'bullmq';

import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

import { sleep } from '@common/utils/sleep';

export const TEST_QUEUE_NAME = 'test';
export const InjectTestQueue = (): ParameterDecorator => InjectQueue(TEST_QUEUE_NAME);

@Processor(TEST_QUEUE_NAME, {
    concurrency: 1,
})
export class TestProcessor extends WorkerHost {
    private readonly logger = new Logger(TestProcessor.name);

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing ${job.id}`);
        await sleep(53_000);
        this.logger.log(`Completed ${job.id}`);
    }

    // @OnWorkerEvent('active')
    // onActive(job: Job) {
    //     this.logger.log(`Active ${job.id}`);
    // }

    // @OnWorkerEvent('completed')
    // onCompleted(job: Job) {
    //     this.logger.log(`Completed ${job.id}`);
    // }

    // @OnWorkerEvent('failed')
    // onFailed(job: Job) {
    //     this.logger.log(`Failed ${job.id}`);
    // }
}
