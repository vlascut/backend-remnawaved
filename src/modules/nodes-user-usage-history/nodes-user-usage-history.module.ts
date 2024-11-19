import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@common/database';
import { NodesUserUsageHistoryConverter } from './nodes-user-usage-history.converter';
import { NodesUserUsageHistoryRepository } from './repositories/nodes-user-usage-history.repository';
import { NodesUserUsageHistoryController } from './nodes-user-usage-history.controller';
import { NodesUserUsageHistoryService } from './nodes-user-usage-history.service';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [NodesUserUsageHistoryController],
    providers: [
        NodesUserUsageHistoryRepository,
        NodesUserUsageHistoryConverter,
        NodesUserUsageHistoryService,
    ],
})
export class NodesUserUsageHistoryModule {}
