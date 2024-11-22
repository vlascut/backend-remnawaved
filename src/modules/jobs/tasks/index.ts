import { NodeHealthCheckService } from './node-health-check/node-health-check.service';
import { RecordNodesUsageService } from './record-nodes-usage/record-nodes-usage.service';
import { RecordUserUsageService } from './record-user-usage/record-user-usage.service';
import { ReviewUsersService } from './review-users/review-users.service';
import { ResetUserTrafficService } from './reset-user-traffic/reset-user-traffic.service';

export const JOBS_SERVICES = [
    NodeHealthCheckService,
    RecordNodesUsageService,
    RecordUserUsageService,
    ReviewUsersService,
    ResetUserTrafficService,
];
