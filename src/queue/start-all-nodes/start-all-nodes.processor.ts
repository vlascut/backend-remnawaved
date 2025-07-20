import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Scope } from '@nestjs/common';

import { NodesEntity, NodesRepository } from '@modules/nodes';

import { StartAllNodesByProfileQueueService } from '@queue/start-all-nodes-by-profile';

import { StartAllNodesJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(
    {
        name: QueueNames.startAllNodes,
        scope: Scope.REQUEST,
    },
    {
        concurrency: 1,
    },
)
export class StartAllNodesQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(StartAllNodesQueueProcessor.name);

    constructor(
        private readonly nodesRepository: NodesRepository,
        private readonly startAllNodesByProfileQueueService: StartAllNodesByProfileQueueService,
    ) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case StartAllNodesJobNames.startAllNodes:
                return this.handleStartAllNodes();
            default:
                this.logger.warn(`Job "${job.name}" is not handled.`);
                break;
        }
    }

    private async handleStartAllNodes() {
        try {
            const nodes = await this.nodesRepository.findByCriteria({
                isDisabled: false,
            });

            if (!nodes) {
                return;
            }

            const groupedByProfile = new Map<string, NodesEntity[]>();

            for (const node of nodes) {
                if (!node.activeConfigProfileUuid) {
                    this.logger.warn(`Node "${node.uuid}" has no active config profile`);
                    continue;
                }
                const nodes = groupedByProfile.get(node.activeConfigProfileUuid) || [];
                nodes.push(node);
                groupedByProfile.set(node.activeConfigProfileUuid, nodes);
            }

            for (const profile of groupedByProfile.keys()) {
                await this.startAllNodesByProfileQueueService.startAllNodesByProfile({
                    profileUuid: profile,
                    emitter: 'StartAllNodesQueueProcessor',
                });
            }
        } catch (error) {
            this.logger.error(
                `Error handling "${StartAllNodesJobNames.startAllNodes}" job: ${error}`,
            );
        }
    }
}
