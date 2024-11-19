import { Injectable } from '@nestjs/common';
import { NodesUserUsageHistoryRepository } from './repositories/nodes-user-usage-history.repository';

@Injectable()
export class NodesUserUsageHistoryService {
    constructor(
        private readonly nodesUserUsageHistoryRepository: NodesUserUsageHistoryRepository,
    ) {}
}
