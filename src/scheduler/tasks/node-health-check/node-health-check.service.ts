import { StartAllNodesQueueService } from 'src/queue/start-all-nodes/start-all-nodes.service';

import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { GetSystemStatsCommand } from '@remnawave/node-contract';

import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS } from '@libs/contracts/constants';

import { NodeEvent } from '@intergration-modules/telegram-bot/events/nodes/interfaces';

import { GetEnabledNodesQuery } from '@modules/nodes/queries/get-enabled-nodes';
import { UpdateNodeCommand } from '@modules/nodes/commands/update-node';
import { StartNodeEvent } from '@modules/nodes/events/start-node';
import { NodesEntity } from '@modules/nodes';

import { JOBS_INTERVALS } from '../../intervals';

@Injectable()
export class NodeHealthCheckService {
    private static readonly CRON_NAME = 'nodeHealthCheck';
    private readonly logger = new Logger(NodeHealthCheckService.name);
    private cronName: string;

    private isNodesRestarted: boolean;
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
        private readonly startAllNodesQueueService: StartAllNodesQueueService,
    ) {
        this.cronName = NodeHealthCheckService.CRON_NAME;
        this.isNodesRestarted = false;
    }

    @Cron(JOBS_INTERVALS.NODE_HEALTH_CHECK, {
        name: NodeHealthCheckService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.isNodesRestarted) {
                this.isNodesRestarted = true;
                this.logger.log('Restarting all nodes on application start');

                await this.startAllNodesQueueService.startAllNodes({
                    emitter: this.cronName,
                });

                // await this.startAllNodesQueue.add(
                //     QUEUE_NAMES.START_ALL_NODES,
                //     {
                //         test: true,
                //     },
                //     {
                //         deduplication: {
                //             id: QUEUE_NAMES.START_ALL_NODES,
                //         },
                //     },
                // );

                return;
            }

            // const nodesResponse = await this.getEnabledNodes();
            // if (!nodesResponse.isOk || !nodesResponse.response) {
            //     this.logger.error('No enabled nodes found');
            //     return;
            // }

            // const nodes = nodesResponse.response;

            // await this.startNodeQueue.addBulk(
            //     nodesResponse.response.map((node) => ({
            //         name: QUEUE_NAMES.START_NODE,
            //         data: { nodeUuid: node.uuid },
            //         opts: { jobId: QueueUtils.getJobId(QUEUE_NAMES.START_NODE, node.uuid) },
            //     })),
            // );

            // const mapper = async (node: NodesEntity) => {
            //     const response = await this.axios.getSystemStats(node.address, node.port);
            //     switch (response.isOk) {
            //         case true:
            //             return this.handleConnectedNode(node, response.response!);
            //         case false:
            //             return this.handleDisconnectedNode(node, response.message);
            //     }
            // };

            // await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });
        } catch (error) {
            this.logger.error(`Error in NodeHealthCheckService: ${error}`);
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
                isNodeOnline: true,
                isXrayRunning: true,
                lastStatusChange: new Date(),
                lastStatusMessage: '',
            },
        });

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
                usersOnline: 0,
            },
        });

        this.eventBus.publish(new StartNodeEvent(newNodeEntity.response || node));

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
