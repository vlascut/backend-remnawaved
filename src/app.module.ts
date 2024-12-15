import { configSchema, Env } from '@common/config/app-config';
import { PrismaModule } from '@common/database';
import { PrismaService } from '@common/database/prisma.service';
import { validateEnvConfig } from '@common/utils/validate-env-config';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { AxiosModule } from '@common/axios/axios.module';
import { RemnawaveModules } from '@modules/remnawave-backend.modules';
import { IntegrationModules } from '@intergration-modules/integration-modules';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'node:path';
import { ServeStaticModule } from '@nestjs/serve-static';

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
        EventEmitterModule.forRoot(),
        IntegrationModules,
        RemnawaveModules,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'frontend'),
            renderPath: '*',
            exclude: ['/api/(.*)'],
        }),
    ],
})
export class AppModule {}
