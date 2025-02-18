import { GetSystemStatsCommand } from '@remnawave/node-contract';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import pMap from '@cjs-exporter/p-map';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

import { NodeEvent } from '@intergration-modules/telegram-bot/events/nodes/interfaces';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS } from '@libs/contracts/constants';
import { AxiosService } from '@common/axios';

import { GetEnabledNodesQuery } from '../../../modules/nodes/queries/get-enabled-nodes';
import { UpdateNodeCommand } from '../../../modules/nodes/commands/update-node';
import { StartAllNodesEvent } from '../../../modules/nodes/events/start-all-nodes';
import { StartNodeEvent } from '../../../modules/nodes/events/start-node';
import { JOBS_INTERVALS } from '../../intervals';
import { NodesEntity } from '../../../modules/nodes';
import { resolveCountryEmoji } from '@common/utils/resolve-country-emoji';

@Injectable()
export class NodeHealthCheckService {
    private static readonly CRON_NAME = 'nodeHealthCheck';
    private readonly logger = new Logger(NodeHealthCheckService.name);
    private isJobRunning: boolean;
    private cronName: string;
    private CONCURRENCY: number;
    private isNodesRestarted: boolean;
    constructor(
        @InjectMetric('node_status') public nodeStatus: Gauge<string>,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly axios: AxiosService,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.isJobRunning = false;
        this.cronName = NodeHealthCheckService.CRON_NAME;
        this.CONCURRENCY = 20;
        this.isNodesRestarted = false;
    }

    private checkJobRunning(): boolean {
        if (this.isJobRunning) {
            this.logger.log(
                `Job ${this.cronName} is already running. Will retry at ${this.schedulerRegistry.getCronJob(this.cronName).nextDate().toISOTime()}`,
            );
            return false;
        }
        return true;
    }

    @Cron(JOBS_INTERVALS.NODE_HEALTH_CHECK, {
        name: NodeHealthCheckService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            if (!this.isNodesRestarted) {
                this.isNodesRestarted = true;
                this.logger.log('Restarting all nodes on application start');

                await this.eventBus.publish(new StartAllNodesEvent());

                return;
            }

            const nodesResponse = await this.getEnabledNodes();
            if (!nodesResponse.isOk || !nodesResponse.response) {
                this.logger.error('No enabled nodes found');
                return;
            }

            const nodes = nodesResponse.response;

            const mapper = async (node: NodesEntity) => {
                const response = await this.axios.getSystemStats(node.address, node.port);
                switch (response.isOk) {
                    case true:
                        return this.handleConnectedNode(node, response.response!);
                    case false:
                        return this.handleDisconnectedNode(node, response.message);
                }
            };

            await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

            this.logger.debug(`Node health check completed. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(`Error in NodeHealthCheckService: ${error}`);
        } finally {
            this.isJobRunning = false;
        }
    }

    private async handleConnectedNode(node: NodesEntity, response: GetSystemStatsCommand.Response) {
        if (typeof response.response.uptime !== 'number') {
            this.logger.error(`Node ${node.uuid} uptime is not a number`);
            return;
        }

        await this.updateNode({
            node: {
                uuid: node.uuid,
                isConnected: true,
                isConnecting: false,
                isNodeOnline: true,
                isXrayRunning: true,
                lastStatusChange: new Date(),
                lastStatusMessage: '',
            },
        });

        this.nodeStatus.set(
            {
                node_uuid: node.uuid,
                node_name: node.name,
                node_country_emoji: resolveCountryEmoji(node.countryCode),
            },
            1,
        );

        if (!node.isConnected) {
            this.eventEmitter.emit(
                EVENTS.NODE.CONNECTION_RESTORED,
                new NodeEvent(node, EVENTS.NODE.CONNECTION_RESTORED),
            );
        }
    }

    private async handleDisconnectedNode(node: NodesEntity, message: string | undefined) {
        this.logger.debug(`Node ${node.uuid} is disconnected: ${message}`);

        const newNodeEntity = await this.updateNode({
            node: {
                uuid: node.uuid,
                isConnected: false,
                isNodeOnline: false,
                isXrayRunning: false,
                lastStatusChange: new Date(),
                lastStatusMessage: message,
                isDisabled: false,
                isConnecting: false,
                usersOnline: 0,
            },
        });

        this.eventBus.publish(new StartNodeEvent(newNodeEntity.response || node));

        this.nodeStatus.set(
            {
                node_uuid: node.uuid,
                node_name: node.name,
                node_country_emoji: resolveCountryEmoji(node.countryCode),
            },
            0,
        );

        if (node.isConnected) {
            node.lastStatusMessage = message || null;
            this.eventEmitter.emit(
                EVENTS.NODE.CONNECTION_LOST,
                new NodeEvent(node, EVENTS.NODE.CONNECTION_LOST),
            );
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
}
