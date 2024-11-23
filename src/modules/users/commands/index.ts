import { IncrementUsedTrafficHandler } from './increment-used-traffic';
import { ChangeUserStatusHandler } from './change-user-status';
import { UpdateStatusAndTrafficAndResetAtHandler } from './update-status-and-traffic-and-reset-at';
import { UpdateSubLastOpenedAndUserAgentHandler } from './update-sub-last-opened-and-user-agent';

export const COMMANDS = [
    IncrementUsedTrafficHandler,
    ChangeUserStatusHandler,
    UpdateStatusAndTrafficAndResetAtHandler,
    UpdateSubLastOpenedAndUserAgentHandler,
];
