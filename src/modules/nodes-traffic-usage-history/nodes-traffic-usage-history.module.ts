import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@common/database';
import { NodesTrafficUsageHistoryConverter } from './nodes-traffic-usage-history.converter';
import { NodesTrafficUsageHistoryRepository } from './repositories/nodes-traffic-usage-history.repository';
import { NodesTrafficUsageHistoryController } from './nodes-traffic-usage-history.controller';
import { NodesTrafficUsageHistoryService } from './nodes-traffic-usage-history.service';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [NodesTrafficUsageHistoryController],
    providers: [
        NodesTrafficUsageHistoryRepository,
        NodesTrafficUsageHistoryConverter,
        NodesTrafficUsageHistoryService,
    ],
})
export class NodesTrafficUsageHistoryModule {}
