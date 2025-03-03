import { RecordNodesUsageService } from './record-nodes-usage/record-nodes-usage.service';
import { ResetNodeTrafficService } from './reset-node-traffic/reset-node-traffic.service';
import { NodeHealthCheckService } from './node-health-check/node-health-check.service';
import { RecordUserUsageService } from './record-user-usage/record-user-usage.service';
import { ReviewNodesService } from './review-nodes/review-nodes.service';
import { RESET_USER_TRAFFIC_JOBS } from './reset-user-traffic-jobs';
import { METRICS_JOBS_SERVICES } from './metrics-jobs';
import { USERS_JOBS_SERVICES } from './users-jobs';

export const JOBS_SERVICES = [
    NodeHealthCheckService,
    RecordNodesUsageService,
    RecordUserUsageService,

    ResetNodeTrafficService,
    ReviewNodesService,

    ...METRICS_JOBS_SERVICES,

    ...USERS_JOBS_SERVICES,

    ...RESET_USER_TRAFFIC_JOBS,
];
