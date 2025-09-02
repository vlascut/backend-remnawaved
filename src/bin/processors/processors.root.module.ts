import { setSignal, SIGSEGV, SIGABRT, SIGFPE, SIGILL, SIGBUS } from 'segfault-raub';
import { ClsModule } from 'nestjs-cls';

import { QueueModule } from 'src/queue/queue.module';

import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Logger, OnApplicationShutdown, Module, OnModuleInit } from '@nestjs/common';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';

import { validateEnvConfig } from '@common/utils/validate-env-config';
import { PrismaService } from '@common/database/prisma.service';
import { configSchema, Env } from '@common/config/app-config';
import { PrismaModule } from '@common/database';
import { AxiosModule } from '@common/axios';

import { MessagingModules } from '@integration-modules/messaging-modules';

import { RemnawaveModules } from '@modules/remnawave-backend.modules';

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
                        defaultTxOptions: {
                            maxWait: 20_000,
                            timeout: 120_000,
                        },
                    }),
                }),
            ],
            global: true,
            middleware: { mount: true },
        }),
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
        }),

        RemnawaveModules,
        QueueModule,
        MessagingModules,
    ],
    controllers: [],
})
export class ProcessorsRootModule implements OnApplicationShutdown, OnModuleInit {
    private readonly logger = new Logger(ProcessorsRootModule.name);

    async onModuleInit(): Promise<void> {
        setSignal(SIGSEGV, true);
        setSignal(SIGABRT, true);
        setSignal(SIGFPE, true);
        setSignal(SIGILL, true);
        setSignal(SIGBUS, true);

        this.logger.log('Segfault handler');

        // await sleep(3_000);

        // causeSegfault();
    }

    async onApplicationShutdown(signal?: string): Promise<void> {
        this.logger.log(`${signal} signal received, shutting down...`);
        if (signal === 'SIGSEGV') {
            process.exit(1);
        }
    }
}
