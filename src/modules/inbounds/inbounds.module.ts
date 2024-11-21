import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InboundsRepository } from './repositories/inbounds.repository';
import { InboundsConverter } from './converters/inbounds.converter';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';
import { InboundsService } from './inbounds.service';
import { InboundsController } from './inbounds.controller';
import { ActiveUserInboundsRepository } from './repositories/active-user-inbounds.repository';
import { ActiveUserInboundsConverter } from './converters/active-user-inbounds.converter';

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
    ],
})
export class InboundsModule {}
