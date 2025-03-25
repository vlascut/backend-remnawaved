import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { useBullBoard, useQueueProcessor } from '@common/utils/startup-app';

import { WebhookLoggerQueueProcessor } from './webhook-logger.processor';
import { WebhookLoggerQueueService } from './webhook-logger.service';
import { QueueNames } from '../../queue.enum';

const requiredModules = [HttpModule];

const processors = [WebhookLoggerQueueProcessor];
const services = [WebhookLoggerQueueService];

const queues = [BullModule.registerQueue({ name: QueueNames.webhookLogger })];

const bullBoard = [
    BullBoardModule.forFeature({ name: QueueNames.webhookLogger, adapter: BullMQAdapter }),
];

const providers = useQueueProcessor() ? processors : [];
const imports = useBullBoard() ? bullBoard : [];

@Module({
    imports: [...queues, ...imports, ...requiredModules],
    providers: [...providers, ...services],
    exports: [...services],
})
export class WebhookLoggerQueueModule {}
