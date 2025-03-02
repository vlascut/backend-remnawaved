import { UpdateStatusAndTrafficAndResetAtHandler } from './update-status-and-traffic-and-reset-at';
import { UpdateSubLastOpenedAndUserAgentHandler } from './update-sub-last-opened-and-user-agent';
import { IncrementUsedTrafficHandler } from './increment-used-traffic';
import { ChangeUserStatusHandler } from './change-user-status';
import { BatchResetUserTrafficHandler } from './batch-reset-user-traffic';
import { UpdateExpiredUsersHandler } from './update-expired-users';
import { UpdateExceededTrafficUsersHandler } from './update-exceeded-users';
import { BatchResetLimitedUsersTrafficHandler } from './batch-reset-limited-users-traffic';
import { BulkIncrementUsedTrafficHandler } from './bulk-increment-used-traffic';

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
