import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NodesUsageHistoryConverter } from './nodes-usage-history.converter';
import { NodesUsageHistoryRepository } from './repositories/nodes-usage-history.repository';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [NodesUsageHistoryRepository, NodesUsageHistoryConverter, ...COMMANDS, ...QUERIES],
})
export class NodesUsageHistoryModule {}
