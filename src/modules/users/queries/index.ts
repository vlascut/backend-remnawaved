import { GetUsersForConfigHandler } from './get-users-for-config';
import { GetUserByUsernameHandler } from './get-user-by-username';
import { GetActiveUsersHandler } from './get-active-users';
import { GetAllUsersHandler } from './get-all-users';

export const QUERIES = [
    GetUsersForConfigHandler,
    GetUserByUsernameHandler,
    GetActiveUsersHandler,
    GetAllUsersHandler,
];
