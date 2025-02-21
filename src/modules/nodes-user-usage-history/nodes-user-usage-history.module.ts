import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { NodesUserUsageHistoryRepository } from './repositories/nodes-user-usage-history.repository';
import { NodesUserUsageHistoryConverter } from './nodes-user-usage-history.converter';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';
@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [
        NodesUserUsageHistoryRepository,
        NodesUserUsageHistoryConverter,
        ...COMMANDS,
        ...QUERIES,
    ],
})
export class NodesUserUsageHistoryModule {}
