import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NodesUserUsageHistoryConverter } from './nodes-user-usage-history.converter';
import { NodesUserUsageHistoryRepository } from './repositories/nodes-user-usage-history.repository';
import { NodesUserUsageHistoryController } from './nodes-user-usage-history.controller';
import { NodesUserUsageHistoryService } from './nodes-user-usage-history.service';
import { COMMANDS } from './commands';

@Module({
    imports: [CqrsModule],
    controllers: [NodesUserUsageHistoryController],
    providers: [
        NodesUserUsageHistoryRepository,
        NodesUserUsageHistoryConverter,
        NodesUserUsageHistoryService,
        ...COMMANDS,
    ],
})
export class NodesUserUsageHistoryModule {}
