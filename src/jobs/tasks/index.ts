import { ResetUserTrafficCalendarMonthService } from './reset-user-traffic-calendar-month/reset-user-traffic-calendar-month.service';
import { RecordNodesUsageService } from './record-nodes-usage/record-nodes-usage.service';
import { ResetUserTrafficService } from './reset-user-traffic/reset-user-traffic.service';
import { ResetNodeTrafficService } from './reset-node-traffic/reset-node-traffic.service';
import { NodeHealthCheckService } from './node-health-check/node-health-check.service';
import { RecordUserUsageService } from './record-user-usage/record-user-usage.service';
import { ReviewNodesService } from './review-nodes/review-nodes.service';
import { METRICS_JOBS_SERVICES } from './metrics-jobs';
import { USERS_JOBS_SERVICES } from './users-jobs';
export const JOBS_SERVICES = [
    NodeHealthCheckService,
    RecordNodesUsageService,
    RecordUserUsageService,

    ResetUserTrafficService,
    ResetNodeTrafficService,
    ReviewNodesService,
    ResetUserTrafficCalendarMonthService,

    ...METRICS_JOBS_SERVICES,

    ...USERS_JOBS_SERVICES,
];
