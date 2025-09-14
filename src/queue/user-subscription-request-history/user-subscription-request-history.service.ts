import { Queue } from 'bullmq';
import _ from 'lodash';

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { IAddUserSubscriptionRequestHistoryPayload } from './interfaces';
import { UserSubscriptionRequestHistoryJobNames } from './enums';
import { AbstractQueueService } from '../queue.service';
import { QueueNames } from '../queue.enum';

@Injectable()
export class UserSubscriptionRequestHistoryQueueService
    extends AbstractQueueService
    implements OnApplicationBootstrap
{
    protected readonly logger: Logger = new Logger(
        _.upperFirst(_.camelCase(QueueNames.userSubscriptionRequestHistory)),
    );

    private _queue: Queue;

    get queue(): Queue {
        return this._queue;
    }

    constructor(
        @InjectQueue(QueueNames.userSubscriptionRequestHistory)
        private readonly userSubscriptionRequestHistoryQueue: Queue,
    ) {
        super();
        this._queue = this.userSubscriptionRequestHistoryQueue;
    }

    public async onApplicationBootstrap(): Promise<void> {
        await this.checkConnection();
    }

    public async addRecord(payload: IAddUserSubscriptionRequestHistoryPayload) {
        return this.addJob(UserSubscriptionRequestHistoryJobNames.addRecord, payload);
    }
}
