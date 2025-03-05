import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { NodesModule } from '@modules/nodes';

import { BULLMQ_QUEUES } from './queues.definitions';
import { EVENTS_PROCESSORS } from './events';

@Module({
    imports: [CqrsModule, NodesModule, BullModule.registerQueue(...BULLMQ_QUEUES)],
    providers: [...EVENTS_PROCESSORS],
})
export class ProcessorsModule {}
