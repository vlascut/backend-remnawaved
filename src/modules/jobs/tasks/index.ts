import { RecordNodesUsageService } from './record-nodes-usage/record-nodes-usage.service';
import { ResetUserTrafficService } from './reset-user-traffic/reset-user-traffic.service';
import { ResetNodeTrafficService } from './reset-node-traffic/reset-node-traffic.service';
import { NodeHealthCheckService } from './node-health-check/node-health-check.service';
import { RecordUserUsageService } from './record-user-usage/record-user-usage.service';
import { ReviewUsersService } from './review-users/review-users.service';
import { ReviewNodesService } from './review-nodes/review-nodes.service';

export const JOBS_SERVICES = [
    NodeHealthCheckService,
    RecordNodesUsageService,
    RecordUserUsageService,
    ReviewUsersService,
    ResetUserTrafficService,
    ResetNodeTrafficService,
    ReviewNodesService,
];
