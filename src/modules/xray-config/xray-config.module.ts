import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@common/database';
import { XrayConfigConverter } from './xray-config.converter';
import { XrayConfigRepository } from './repositories/xray-config.repository';
import { XrayConfigController } from './xray-config.controller';
import { XrayConfigService } from './xray-config.service';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [XrayConfigController],
    providers: [XrayConfigRepository, XrayConfigConverter, XrayConfigService],
    exports: [XrayConfigService],
})
export class XrayConfigModule {}
