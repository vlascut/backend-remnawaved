import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { useBullBoard, useQueueProcessor } from '@common/utils/startup-app';

import { InternalSquadActionsQueueProcessor } from './internal-squad-actions.processor';
import { InternalSquadActionsQueueService } from './internal-squad-actions.service';
import { QueueNames } from '../queue.enum';

const requiredModules = [CqrsModule];

const processors = [InternalSquadActionsQueueProcessor];
const services = [InternalSquadActionsQueueService];

const queues = [BullModule.registerQueue({ name: QueueNames.internalSquadActions })];

const bullBoard = [
    BullBoardModule.forFeature({ name: QueueNames.internalSquadActions, adapter: BullMQAdapter }),
];

const providers = useQueueProcessor() ? processors : [];
const imports = useBullBoard() ? bullBoard : [];

@Module({
    imports: [...queues, ...imports, ...requiredModules],
    providers: [...providers, ...services],
    exports: [...services],
})
export class InternalSquadActionsQueueModule {}
