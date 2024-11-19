import { Controller } from '@nestjs/common';
import { NodesUserUsageHistoryService } from './nodes-user-usage-history.service';

@Controller('nodes-user-usage-history')
export class NodesUserUsageHistoryController {
    constructor(private readonly nodesUserUsageHistoryService: NodesUserUsageHistoryService) {}
}
