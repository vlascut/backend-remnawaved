import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { HostsRepository } from './repositories/hosts.repository';
import { HostsController } from './hosts.controller';
import { HostsConverter } from './hosts.converter';
import { HostsService } from './hosts.service';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [HostsController],
    providers: [HostsRepository, HostsConverter, HostsService, ...QUERIES],
})
export class HostsModule {}
