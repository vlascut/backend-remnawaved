import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullModule } from '@nestjs/bullmq';
import { TEST_QUEUE_NAME, TestProcessor } from './processors/test.processor';

@Module({
    imports: [
        BullModule.registerQueue(
            {
                name: TEST_QUEUE_NAME,
            },
            {
                name: 'test2',
            },
        ),

        BullBoardModule.forFeature(
            {
                name: TEST_QUEUE_NAME,
                adapter: BullMQAdapter,
                options: {},
            },
            {
                name: 'test2',
                adapter: BullMQAdapter,
                options: {},
            },
        ),
    ],
    providers: [TestProcessor],
})
export class QueueModule {}
