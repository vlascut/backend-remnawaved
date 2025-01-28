import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { join } from 'node:path';

import { IntegrationModules } from '@intergration-modules/integration-modules';
import { validateEnvConfig } from '@common/utils/validate-env-config';
import { RemnawaveModules } from '@modules/remnawave-backend.modules';
import { PrismaService } from '@common/database/prisma.service';
import { configSchema, Env } from '@common/config/app-config';
import { AxiosModule } from '@common/axios/axios.module';
import { PrismaModule } from '@common/database';

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
        ServeStaticModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => [
                {
                    rootPath: join(__dirname, '..', '..', 'frontend'),
                    renderPath: '*splat',
                    exclude: [
                        '/api/(.*)',
                        configService.getOrThrow<string>('SWAGGER_PATH'),
                        configService.getOrThrow<string>('SCALAR_PATH'),
                    ],
                },
            ],
        }),
    ],
})
export class AppModule {}
