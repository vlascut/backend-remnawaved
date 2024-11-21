import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NodesConverter } from './nodes.converter';
import { NodesRepository } from './repositories/nodes.repository';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';
import { EVENTS } from './events';

@Module({
    imports: [CqrsModule],
    controllers: [NodesController],
    providers: [NodesRepository, NodesConverter, NodesService, ...EVENTS],
})
export class NodesModule {}
