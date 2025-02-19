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
import { JobsModule } from './jobs/jobs.module';
import { PrometheusReporterModule } from '@intergration-modules/prometheus-reporter/prometheus-reporter.module';

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
        PrometheusReporterModule,
    ],
    controllers: [],
})
export class WorkerModule {}
