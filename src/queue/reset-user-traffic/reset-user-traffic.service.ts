import { Queue } from 'bullmq';
import _ from 'lodash';

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { AbstractQueueService } from '../queue.service';
import { ResetUserTrafficJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Injectable()
export class ResetUserTrafficQueueService
    extends AbstractQueueService
    implements OnApplicationBootstrap
{
    protected readonly logger: Logger = new Logger(
        _.upperFirst(_.camelCase(QueueNames.resetUserTraffic)),
    );

    private _queue: Queue;

    get queue(): Queue {
        return this._queue;
    }

    constructor(
        @InjectQueue(QueueNames.resetUserTraffic) private readonly resetUserTrafficQueue: Queue,
    ) {
        super();
        this._queue = this.resetUserTrafficQueue;
    }

    public async onApplicationBootstrap(): Promise<void> {
        await this.checkConnection();
    }

    public async resetDailyUserTraffic(payload: void) {
        return this.addJob(ResetUserTrafficJobNames.resetDailyUserTraffic, payload);
    }

    public async resetMonthlyUserTraffic(payload: void) {
        return this.addJob(ResetUserTrafficJobNames.resetMonthlyUserTraffic, payload);
    }

    public async resetWeeklyUserTraffic(payload: void) {
        return this.addJob(ResetUserTrafficJobNames.resetWeeklyUserTraffic, payload);
    }
}
