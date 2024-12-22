import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { XrayConfigRepository } from './repositories/xray-config.repository';
import { XrayConfigController } from './xray-config.controller';
import { XrayConfigConverter } from './xray-config.converter';
import { XrayConfigService } from './xray-config.service';
import { QUERIES } from './queries';
@Module({
    imports: [CqrsModule],
    controllers: [XrayConfigController],
    providers: [...QUERIES, XrayConfigRepository, XrayConfigConverter, XrayConfigService],
})
export class XrayConfigModule implements OnApplicationBootstrap {
    constructor(private readonly xrayConfigService: XrayConfigService) {}

    async onApplicationBootstrap() {
        await this.xrayConfigService.syncInbounds();
    }
}
// export class XrayConfigModule {}
