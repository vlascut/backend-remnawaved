import { Injectable } from '@nestjs/common';
import { NodesUsageHistoryRepository } from './repositories/nodes-usage-history.repository';

@Injectable()
export class NodesUsageHistoryService {
    constructor(private readonly nodesUsageHistoryRepository: NodesUsageHistoryRepository) {}
}
