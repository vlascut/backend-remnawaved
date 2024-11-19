import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InboundsRepository } from './repositories/inbounds.repository';
import { InboundsConverter } from './inbounds.converter';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [...COMMANDS, ...QUERIES, InboundsRepository, InboundsConverter],
})
export class InboundsModule {}
