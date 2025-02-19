import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetEnabledNodesQuery } from '@modules/nodes/queries/get-enabled-nodes/get-enabled-nodes.query';
import { NodeEvent } from '@intergration-modules/telegram-bot/events/nodes/interfaces';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { NodesEntity } from '@modules/nodes/entities/nodes.entity';
import { EVENTS } from '@libs/contracts/constants/events/events';

import { JOBS_INTERVALS } from '../../intervals';

@Injectable()
export class ReviewNodesService {
    private static readonly CRON_NAME = 'reviewNodes';
    private readonly logger = new Logger(ReviewNodesService.name);
    private isJobRunning: boolean;
    private cronName: string;
    private notifiedNodes: Map<string, boolean>;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.isJobRunning = false;
        this.cronName = ReviewNodesService.CRON_NAME;
        this.notifiedNodes = new Map();
    }

    private checkJobRunning(): boolean {
        if (this.isJobRunning) {
            this.logger.debug(
                `Job ${this.cronName} is already running. Will retry at ${this.schedulerRegistry.getCronJob(this.cronName).nextDate().toISOTime()}`,
            );
            return false;
        }
        return true;
    }

    @Cron(JOBS_INTERVALS.REVIEW_NODES, {
        name: ReviewNodesService.CRON_NAME,
    })
    async handleCron() {
        let nodes: NodesEntity[] | null = null;
        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const nodesResponse = await this.getEnabledNodes();
            if (!nodesResponse.isOk || !nodesResponse.response) {
                this.logger.error('No enabled nodes found');
                return;
            }

            const nodes = nodesResponse.response;

            for (const node of nodes) {
                if (node.isTrafficTrackingActive === false) continue;

                const limit = node.trafficLimitBytes || BigInt(0);
                const used = node.trafficUsedBytes || BigInt(0);

                const notifyPercent = node.notifyPercent || 0;

                const currentPercent = limit > 0 ? Number((used * BigInt(100)) / limit) : 0;

                if (currentPercent >= notifyPercent && !this.notifiedNodes.get(node.uuid)) {
                    this.logger.log(
                        `Node ${node.uuid} has exceeded ${currentPercent}% of traffic limit (${notifyPercent}% threshold)`,
                    );

                    this.eventEmitter.emit(
                        EVENTS.NODE.TRAFFIC_NOTIFY,
                        new NodeEvent(node, EVENTS.NODE.TRAFFIC_NOTIFY),
                    );

                    this.notifiedNodes.set(node.uuid, true);
                } else if (currentPercent < notifyPercent && this.notifiedNodes.get(node.uuid)) {
                    this.notifiedNodes.delete(node.uuid);
                }
            }

            this.logger.debug(`Reviewed nodes. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(error);
        } finally {
            this.isJobRunning = false;
            nodes = null;
        }
    }

    private async getEnabledNodes(): Promise<ICommandResponse<NodesEntity[]>> {
        return this.queryBus.execute<GetEnabledNodesQuery, ICommandResponse<NodesEntity[]>>(
            new GetEnabledNodesQuery(),
        );
    }
}
