import { ConfigModule, ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: PrismaService,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return PrismaService.withKysely(config);
            },
        },
    ],
    exports: [PrismaService],
})
export class PrismaModule {}
