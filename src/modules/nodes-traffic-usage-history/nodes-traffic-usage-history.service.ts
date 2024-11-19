import { Injectable } from '@nestjs/common';
import { NodesTrafficUsageHistoryRepository } from './repositories/nodes-traffic-usage-history.repository';

@Injectable()
export class NodesTrafficUsageHistoryService {
    constructor(
        private readonly nodesTrafficUsageHistoryRepository: NodesTrafficUsageHistoryRepository,
    ) {}
}
