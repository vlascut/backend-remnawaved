import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import { IntegrationModules } from '@intergration-modules/integration-modules';
import { validateEnvConfig } from '@common/utils/validate-env-config';
import { RemnawaveModules } from '@modules/remnawave-backend.modules';
import { PrismaService } from '@common/database/prisma.service';
import { configSchema, Env } from '@common/config/app-config';
import { AxiosModule } from '@common/axios/axios.module';
import { PrismaModule } from '@common/database';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './microservices/queue.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BasicAuthMiddleware } from '@common/middlewares/basic-auth.middleware';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { TEST_QUEUE_NAME } from './microservices/processors/test.processor';
import { JobsModule } from './jobs/jobs.module';

@Module({
    imports: [
        AxiosModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validate: (config) => validateEnvConfig<Env>(configSchema, config),
        }),
        PrismaModule,
        ClsModule.forRoot({
            plugins: [
                new ClsPluginTransactional({
                    imports: [PrismaModule],
                    adapter: new TransactionalAdapterPrisma({
                        prismaInjectionToken: PrismaService,
                    }),
                }),
            ],
            global: true,
            middleware: { mount: true },
        }),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
        }),
        IntegrationModules,
        RemnawaveModules,
        // BullModule.forRoot({
        //     connection: {
        //         host: '127.0.0.1',
        //         port: 6379,
        //         db: 3,
        //         // password: '123456',
        //     },
        // }),
        // BullBoardModule.forRoot({
        //     route: '/queues',
        //     adapter: ExpressAdapter,
        //     middleware: [BasicAuthMiddleware],
        //     boardOptions: {
        //         uiConfig: {
        //             boardTitle: 'Remnawave',
        //         },
        //     },
        // }),
        JobsModule,
        // QueueModule,
    ],
    controllers: [],
})
export class WorkerModule {}
