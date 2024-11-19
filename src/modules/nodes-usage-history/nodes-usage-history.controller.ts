import { Controller } from '@nestjs/common';
import { NodesUsageHistoryService } from './nodes-usage-history.service';

@Controller('nodes-usage-history')
export class NodesUsageHistoryController {
    constructor(private readonly nodesUsageHistoryService: NodesUsageHistoryService) {}
}
