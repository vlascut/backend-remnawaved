import {
    MessagingRedisExtensionModule,
    RedisChannelConfig,
} from '@nestjstools/messaging-redis-extension';
import { MessagingModule } from '@nestjstools/messaging';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { isDevelopment, isScheduler } from '@common/utils/startup-app';
import { MessagingBuses, MessagingChannels, MessagingQueues } from '@libs/contracts/constants';

@Module({
    imports: [
        MessagingRedisExtensionModule,
        MessagingModule.forRootAsync({
            imports: [ConfigModule],
            buses: [
                {
                    name: MessagingBuses.EVENT,
                    channels: [MessagingChannels.EVENT],
                },
            ],
            inject: [ConfigService],
            useChannelFactory: (configService: ConfigService) => {
                return [
                    new RedisChannelConfig({
                        name: MessagingChannels.EVENT,
                        queue: MessagingQueues.EVENT,
                        connectionOptions: {
                            redis: {
                                host: configService.getOrThrow<string>('REDIS_HOST'),
                                port: configService.getOrThrow<number>('REDIS_PORT'),
                                db: configService.getOrThrow<number>('REDIS_DB'),
                                password: configService.get<string | undefined>('REDIS_PASSWORD'),
                            },
                            prefix: 'ebus',
                        },
                        middlewares: [],
                        avoidErrorsForNotExistedHandlers: true,
                        enableConsumer: isScheduler(),
                    }),
                ];
            },
            debug: isDevelopment(),
        }),
    ],
})
export class MessagingModules {}
