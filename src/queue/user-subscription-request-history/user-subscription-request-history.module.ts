import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { useBullBoard, useQueueProcessor } from '@common/utils/startup-app';

import { UserSubscriptionRequestHistoryQueueProcessor } from './user-subscription-request-history.processor';
import { UserSubscriptionRequestHistoryQueueService } from './user-subscription-request-history.service';
import { QueueNames } from '../queue.enum';

const requiredModules = [CqrsModule];

const processors = [UserSubscriptionRequestHistoryQueueProcessor];
const services = [UserSubscriptionRequestHistoryQueueService];

const queues = [BullModule.registerQueue({ name: QueueNames.userSubscriptionRequestHistory })];

const bullBoard = [
    BullBoardModule.forFeature({
        name: QueueNames.userSubscriptionRequestHistory,
        adapter: BullMQAdapter,
    }),
];

const providers = useQueueProcessor() ? processors : [];
const imports = useBullBoard() ? bullBoard : [];

@Module({
    imports: [...queues, ...imports, ...requiredModules],
    providers: [...providers, ...services],
    exports: [...services],
})
export class UserSubscriptionRequestHistoryQueueModule {}
