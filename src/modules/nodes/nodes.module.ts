import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@common/database';
import { NodesConverter } from './nodes.converter';
import { NodesRepository } from './repositories/nodes.repository';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [NodesController],
    providers: [NodesRepository, NodesConverter, NodesService],
})
export class NodesModule {}
