import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DebugJob {
    private static readonly CRON_NAME = 'debug';
    private readonly logger = new Logger(DebugJob.name);
    private isJobRunning: boolean;
    private cronName: string;

    constructor() {
        this.isJobRunning = false;
        this.cronName = DebugJob.CRON_NAME;
    }

    @Cron(CronExpression.EVERY_SECOND, {
        name: DebugJob.CRON_NAME,
    })
    async handleCron() {
        const used = process.memoryUsage();

        this.logger.debug(`Memory usage at debug job:`);
        this.logger.debug(`RSS: ${Math.round(used.rss / 1024 / 1024)}MB`);
        this.logger.debug(`Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)}MB`);
        this.logger.debug(`Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
        this.logger.debug(`External: ${Math.round(used.external / 1024 / 1024)}MB`);
        this.logger.debug(`ArrayBuffers: ${Math.round(used.arrayBuffers / 1024 / 1024)}MB`);
        this.logger.debug('-------------------');
    }
}
