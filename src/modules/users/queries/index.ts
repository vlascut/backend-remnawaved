import { GetUserByShortUuidHandler } from './get-user-by-short-uuid';
import { GetUsersForConfigHandler } from './get-users-for-config';
import { GetUserByUsernameHandler } from './get-user-by-username';
import { GetShortUserStatsHandler } from './get-short-user-stats';
import { GetActiveUsersHandler } from './get-active-users';
import { GetAllUsersHandler } from './get-all-users';

export const QUERIES = [
    GetUsersForConfigHandler,
    GetUserByUsernameHandler,
    GetActiveUsersHandler,
    GetAllUsersHandler,
    GetUserByShortUuidHandler,
    GetShortUserStatsHandler,
];
