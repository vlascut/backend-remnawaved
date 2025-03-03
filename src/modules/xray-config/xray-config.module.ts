import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { UsersModule } from '@modules/users/users.module';

import { XrayConfigRepository } from './repositories/xray-config.repository';
import { XrayConfigController } from './xray-config.controller';
import { XrayConfigConverter } from './xray-config.converter';
import { XrayConfigService } from './xray-config.service';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule, UsersModule],
    controllers: [XrayConfigController],
    providers: [XrayConfigService, XrayConfigRepository, XrayConfigConverter, ...QUERIES],
    exports: [],
})
export class XrayConfigModule {}
