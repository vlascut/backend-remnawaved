import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NodesTrafficUsageHistoryConverter } from './nodes-traffic-usage-history.converter';
import { NodesTrafficUsageHistoryRepository } from './repositories/nodes-traffic-usage-history.repository';
import { NodesTrafficUsageHistoryController } from './nodes-traffic-usage-history.controller';
import { NodesTrafficUsageHistoryService } from './nodes-traffic-usage-history.service';
import { COMMANDS } from './commands';

@Module({
    imports: [CqrsModule],
    controllers: [NodesTrafficUsageHistoryController],
    providers: [
        NodesTrafficUsageHistoryRepository,
        NodesTrafficUsageHistoryConverter,
        NodesTrafficUsageHistoryService,
        ...COMMANDS,
    ],
})
export class NodesTrafficUsageHistoryModule {}
