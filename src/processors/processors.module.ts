import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { NodesModule } from '@modules/nodes';

import { BULLMQ_QUEUES } from './queues.definitions';

@Module({
    imports: [CqrsModule, NodesModule, BullModule.registerQueue(...BULLMQ_QUEUES)],
    providers: [],
})
export class ProcessorsModule {}
