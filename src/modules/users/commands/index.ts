import { IncrementUsedTrafficHandler } from './increment-used-traffic';
import { ChangeUserStatusHandler } from './change-user-status';
import { UpdateStatusAndTrafficAndResetAtHandler } from './update-status-and-traffic-and-reset-at';

export const COMMANDS = [
    IncrementUsedTrafficHandler,
    ChangeUserStatusHandler,
    UpdateStatusAndTrafficAndResetAtHandler,
];
