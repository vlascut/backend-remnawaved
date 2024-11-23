import { GetUsersForConfigHandler } from './get-users-for-config';
import { GetUserByUsernameHandler } from './get-user-by-username';
import { GetActiveUsersHandler } from './get-active-users';
import { GetAllUsersHandler } from './get-all-users';
import { GetUserByShortUuidHandler } from './get-user-by-short-uuid';

export const QUERIES = [
    GetUsersForConfigHandler,
    GetUserByUsernameHandler,
    GetActiveUsersHandler,
    GetAllUsersHandler,
    GetUserByShortUuidHandler,
];
