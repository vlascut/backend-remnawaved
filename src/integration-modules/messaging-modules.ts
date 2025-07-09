import {
    MessagingRedisExtensionModule,
    RedisChannelConfig,
} from '@nestjstools/messaging-redis-extension';
import { MessagingModule } from '@nestjstools/messaging';
import { Module } from '@nestjs/common';

import { isDevelopment, isScheduler } from '@common/utils/startup-app';
import { MessagingBuses, MessagingChannels, MessagingQueues } from '@libs/contracts/constants';

@Module({
    imports: [
        MessagingRedisExtensionModule,
        MessagingModule.forRoot({
            buses: [
                {
                    name: MessagingBuses.EVENT,
                    channels: [MessagingChannels.EVENT],
                },
            ],
            channels: [
                new RedisChannelConfig({
                    name: MessagingChannels.EVENT,
                    queue: MessagingQueues.EVENT,
                    connection: {
                        host: process.env.REDIS_HOST!,
                        port: Number(process.env.REDIS_PORT!),
                        // password: process.env.REDIS_PASSWORD || undefined,
                        // db: Number(process.env.REDIS_DB) || undefined,
                        // TODO: update lib to include DB number
                    },
                    middlewares: [],
                    avoidErrorsForNotExistedHandlers: true,
                    enableConsumer: isScheduler(),
                }),
            ],

            debug: isDevelopment(),
        }),
    ],
})
export class MessagingModules {}
