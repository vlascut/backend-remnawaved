import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';

import { CreateNodeTrafficUsageHistoryCommand } from '@modules/nodes-traffic-usage-history/commands/create-node-traffic-usage-history';
import { NodesTrafficUsageHistoryEntity } from '@modules/nodes-traffic-usage-history/entities/nodes-traffic-usage-history.entity';
import { GetEnabledNodesQuery } from '@modules/nodes/queries/get-enabled-nodes/get-enabled-nodes.query';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { UpdateNodeCommand } from '@modules/nodes/commands/update-node';
import { ICommandResponse } from '@common/types/command-response.type';
import { NodesEntity } from '@modules/nodes/entities/nodes.entity';

import { JOBS_INTERVALS } from '../../intervals';

@Injectable()
export class ResetNodeTrafficService {
    private static readonly CRON_NAME = 'resetNodeTraffic';
    private readonly logger = new Logger(ResetNodeTrafficService.name);
    private isJobRunning: boolean;
    private cronName: string;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.isJobRunning = false;
        this.cronName = ResetNodeTrafficService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.RESET_NODE_TRAFFIC, {
        name: ResetNodeTrafficService.CRON_NAME,
    })
    async handleCron() {
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

                const resetDay = node.trafficResetDay || 1;
                const today = dayjs();
                const currentDay = today.date();
                const lastDayOfMonth = today.endOf('month').date();

                if (
                    (resetDay > lastDayOfMonth && currentDay === lastDayOfMonth) ||
                    currentDay === resetDay
                ) {
                    this.logger.log(`Resetting node traffic for ${node.uuid}`);
                    const entity = new NodesTrafficUsageHistoryEntity({
                        nodeUuid: node.uuid,
                        trafficBytes: node.trafficUsedBytes || BigInt(0),
                        resetAt: today.toDate(),
                    });

                    await this.createNodeTrafficUsageHistory({
                        nodeTrafficUsageHistory: entity,
                    });

                    await this.updateNode({
                        node: {
                            uuid: node.uuid,
                            trafficUsedBytes: BigInt(0),
                        },
                    });
                }
            }

            this.logger.debug(`Reseted node traffic. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(error);
        } finally {
            this.isJobRunning = false;
        }
    }

    private async getEnabledNodes(): Promise<ICommandResponse<NodesEntity[]>> {
        return this.queryBus.execute<GetEnabledNodesQuery, ICommandResponse<NodesEntity[]>>(
            new GetEnabledNodesQuery(),
        );
    }

    private async updateNode(dto: UpdateNodeCommand): Promise<ICommandResponse<NodesEntity>> {
        return this.commandBus.execute<UpdateNodeCommand, ICommandResponse<NodesEntity>>(
            new UpdateNodeCommand(dto.node),
        );
    }

    private async createNodeTrafficUsageHistory(
        dto: CreateNodeTrafficUsageHistoryCommand,
    ): Promise<ICommandResponse<NodesTrafficUsageHistoryEntity>> {
        return this.commandBus.execute<
            CreateNodeTrafficUsageHistoryCommand,
            ICommandResponse<NodesTrafficUsageHistoryEntity>
        >(new CreateNodeTrafficUsageHistoryCommand(dto.nodeTrafficUsageHistory));
    }
}
