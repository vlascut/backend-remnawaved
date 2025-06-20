import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { useBullBoard, useQueueProcessor } from '@common/utils/startup-app';

import { NodesModule } from '@modules/nodes';

import { StartAllNodesByProfileQueueProcessor } from './start-all-nodes-by-profile.processor';
import { StartAllNodesByProfileQueueService } from './start-all-nodes-by-profile.service';
import { StartAllNodesByProfileQueueEvents } from './start-all-nodes-by-profile.events';
import { QueueNames } from '../queue.enum';

const requiredModules = [CqrsModule, NodesModule];

const processors = [StartAllNodesByProfileQueueProcessor, StartAllNodesByProfileQueueEvents];
const services = [StartAllNodesByProfileQueueService];

const queues = [BullModule.registerQueue({ name: QueueNames.startAllNodesByProfile })];

const bullBoard = [
    BullBoardModule.forFeature({ name: QueueNames.startAllNodes, adapter: BullMQAdapter }),
];

const providers = useQueueProcessor() ? processors : [];
const imports = useBullBoard() ? bullBoard : [];

@Module({
    imports: [...queues, ...imports, ...requiredModules],
    providers: [...providers, ...services],
    exports: [...services],
})
export class StartAllNodesByProfileQueueModule {}
