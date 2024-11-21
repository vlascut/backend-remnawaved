import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvConfig } from '@common/utils/validate-env-config';
import { configSchema, Env } from '@common/config/app-config';
import { PrismaModule } from '@common/database';
import { RemnawaveModules } from './modules/remnawave-backend.modules';
import { ClsModule } from 'nestjs-cls';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { PrismaService } from '@common/database/prisma.service';
import { AxiosModule } from './common/axios/axios.module';

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
        RemnawaveModules,
    ],
})
export class AppModule {}
