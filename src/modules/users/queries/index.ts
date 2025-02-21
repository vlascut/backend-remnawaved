import { GetUserByShortUuidHandler } from './get-user-by-short-uuid';
import { GetUsersForConfigHandler } from './get-users-for-config';
import { GetUserByUsernameHandler } from './get-user-by-username';
import { GetShortUserStatsHandler } from './get-short-user-stats';
import { GetActiveUsersHandler } from './get-active-users';
import { GetAllUsersHandler } from './get-all-users';
import { GetExceededTrafficUsageUsersHandler } from './get-exceeded-traffic-usage-users';
import { GetExpiredUsersHandler } from './get-expired-users';
import { GetUsersByTrafficStrategyAndStatusHandler } from './get-users-by-traffic-strategy-and-status';

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
];
