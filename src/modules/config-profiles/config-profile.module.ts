import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { ConfigProfileRepository } from './repositories/config-profile.repository';
import { ConfigProfileController } from './config-profile.controller';
import { ConfigProfileConverter } from './config-profile.converter';
import { ConfigProfileService } from './config-profile.service';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [ConfigProfileController],
    providers: [ConfigProfileRepository, ConfigProfileService, ConfigProfileConverter, ...QUERIES],
})
export class ConfigProfileModule {}
