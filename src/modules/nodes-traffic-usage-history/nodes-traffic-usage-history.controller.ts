import { Controller } from '@nestjs/common';
import { NodesTrafficUsageHistoryService } from './nodes-traffic-usage-history.service';

@Controller('nodes-traffic-usage-history')
export class NodesTrafficUsageHistoryController {
    constructor(
        private readonly nodesTrafficUsageHistoryService: NodesTrafficUsageHistoryService,
    ) {}
}
