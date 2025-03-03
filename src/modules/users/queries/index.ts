import { GetUsersByTrafficStrategyAndStatusHandler } from './get-users-by-traffic-strategy-and-status';
import { GetExceededTrafficUsageUsersHandler } from './get-exceeded-traffic-usage-users';
import { GetUsersForConfigBatchHandler } from './get-users-for-config-batch';
import { GetUserByShortUuidHandler } from './get-user-by-short-uuid';
import { GetUsersForConfigHandler } from './get-users-for-config';
import { GetUserByUsernameHandler } from './get-user-by-username';
import { GetShortUserStatsHandler } from './get-short-user-stats';
import { GetExpiredUsersHandler } from './get-expired-users';
import { GetActiveUsersHandler } from './get-active-users';
import { GetUserByUuidHandler } from './get-user-by-uuid';
import { GetAllUsersHandler } from './get-all-users';

export const QUERIES = [
    GetUsersForConfigHandler,
    GetUserByUsernameHandler,
    GetActiveUsersHandler,
    GetAllUsersHandler,
    GetUserByShortUuidHandler,
    GetShortUserStatsHandler,
    GetExceededTrafficUsageUsersHandler,
    GetExpiredUsersHandler,
    GetUsersByTrafficStrategyAndStatusHandler,
    GetUserByUuidHandler,
    GetUsersForConfigBatchHandler,
];
