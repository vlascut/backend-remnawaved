import { Queue } from 'bullmq';
import _ from 'lodash';

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { NodesEntity } from '@modules/nodes';

import { AbstractQueueService } from '../queue.service';
import { NodeHealthCheckJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Injectable()
export class NodeHealthCheckQueueService
    extends AbstractQueueService
    implements OnApplicationBootstrap
{
    protected readonly logger: Logger = new Logger(
        _.upperFirst(_.camelCase(QueueNames.nodeHealthCheck)),
    );

    private _queue: Queue;

    get queue(): Queue {
        return this._queue;
    }

    constructor(
        @InjectQueue(QueueNames.nodeHealthCheck) private readonly nodeHealthCheckQueue: Queue,
    ) {
        super();
        this._queue = this.nodeHealthCheckQueue;
    }

    public async onApplicationBootstrap(): Promise<void> {
        await this.checkConnection();
    }

    public async checkNodeHealth(payload: Record<string, string>) {
        return this.addJob(NodeHealthCheckJobNames.checkNodeHealth, payload);
    }

    public async checkNodeHealthBulk(payload: NodesEntity[]) {
        return this.queue.addBulk(
            payload.map((node) => ({
                name: NodeHealthCheckJobNames.checkNodeHealth,
                data: { node },
                opts: { jobId: `${NodeHealthCheckJobNames.checkNodeHealth}-${node.uuid}` },
            })),
        );
    }
}
