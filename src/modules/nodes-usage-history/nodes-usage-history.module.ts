import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { NodesUsageHistoryRepository } from './repositories/nodes-usage-history.repository';
import { NodesUsageHistoryConverter } from './nodes-usage-history.converter';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [NodesUsageHistoryRepository, NodesUsageHistoryConverter, ...COMMANDS, ...QUERIES],
})
export class NodesUsageHistoryModule {}
