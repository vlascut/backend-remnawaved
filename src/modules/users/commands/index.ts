import { UpdateStatusAndTrafficAndResetAtHandler } from './update-status-and-traffic-and-reset-at';
import { UpdateSubLastOpenedAndUserAgentHandler } from './update-sub-last-opened-and-user-agent';
import { BatchResetLimitedUsersTrafficHandler } from './batch-reset-limited-users-traffic';
import { BulkIncrementUsedTrafficHandler } from './bulk-increment-used-traffic';
import { UpdateExceededTrafficUsersHandler } from './update-exceeded-users';
import { BatchResetUserTrafficHandler } from './batch-reset-user-traffic';
import { IncrementUsedTrafficHandler } from './increment-used-traffic';
import { UpdateExpiredUsersHandler } from './update-expired-users';
import { ChangeUserStatusHandler } from './change-user-status';

export const COMMANDS = [
    IncrementUsedTrafficHandler,
    ChangeUserStatusHandler,
    UpdateStatusAndTrafficAndResetAtHandler,
    UpdateSubLastOpenedAndUserAgentHandler,
    BatchResetUserTrafficHandler,
    UpdateExpiredUsersHandler,
    UpdateExceededTrafficUsersHandler,
    BatchResetLimitedUsersTrafficHandler,
    BulkIncrementUsedTrafficHandler,
];
