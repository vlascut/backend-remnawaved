import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { NodeInboundExclusionsRepository } from './repositories/node-inbound-exclusions.repository';
import { NodeInboundExclusionsConverter } from './converters/node-inbound-exclusions.converter';
import { ActiveUserInboundsRepository } from './repositories/active-user-inbounds.repository';
import { ActiveUserInboundsConverter } from './converters/active-user-inbounds.converter';
import { InboundsRepository } from './repositories/inbounds.repository';
import { InboundsConverter } from './converters/inbounds.converter';
import { InboundsController } from './inbounds.controller';
import { InboundsService } from './inbounds.service';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [InboundsController],
    providers: [
        ...COMMANDS,
        ...QUERIES,
        InboundsRepository,
        InboundsConverter,
        ActiveUserInboundsRepository,
        ActiveUserInboundsConverter,
        InboundsService,
        NodeInboundExclusionsRepository,
        NodeInboundExclusionsConverter,
    ],
})
export class InboundsModule {}
