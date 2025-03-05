import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { GetSystemStatsCommand } from '@remnawave/node-contract';

import { ICommandResponse } from '@common/types/command-response.type';
import { AxiosService } from '@common/axios';
import { EVENTS } from '@libs/contracts/constants';

import { NodeEvent } from '@intergration-modules/telegram-bot/events/nodes/interfaces';

import { GetEnabledNodesQuery } from '@modules/nodes/queries/get-enabled-nodes';
import { UpdateNodeCommand } from '@modules/nodes/commands/update-node';
import { NodesEntity } from '@modules/nodes/entities/nodes.entity';

import { NodeHealthCheckJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(QueueNames.nodeHealthCheck, {
    concurrency: 40,
})
export class NodeHealthCheckQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(NodeHealthCheckQueueProcessor.name);

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly eventEmitter: EventEmitter2,
        private readonly axios: AxiosService,
    ) {
        super();
    }
    async process(job: Job) {
        switch (job.name) {
            case NodeHealthCheckJobNames.checkNodeHealth:
                return this.handleCheckNodeHealthJob(job);
            default:
                this.logger.warn(`🚨 Job "${job.name}" is not handled.`);
                break;
        }
    }

    private async handleCheckNodeHealthJob(job: Job<NodesEntity>) {
        this.logger.debug(
            `✅ Handling "${NodeHealthCheckJobNames.checkNodeHealth}" job with ID: ${job?.id || ''}, data: ${JSON.stringify(job?.data || '')}`,
        );

        try {
            const response = await this.axios.getSystemStats(job.data.address, job.data.port);
            switch (response.isOk) {
                case true:
                    return this.handleConnectedNode(job.data, response.response!);
                case false:
                    return this.handleDisconnectedNode(job.data, response.message);
            }
        } catch (error) {
            this.logger.error(
                `❌ Error handling "${NodeHealthCheckJobNames.checkNodeHealth}" job: ${error}`,
            );
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

        // this.eventBus.publish(new StartNodeEvent(newNodeEntity.response || node));

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
