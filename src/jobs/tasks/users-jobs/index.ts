import { FindExceededUsageUsersService } from './find-exceeded-usage-users';
import { FindExpiredUsersService } from './find-expired-users';
import { ResetUserTrafficService } from './reset-user-traffic';
import { ResetUserTrafficCalendarMonthService } from './reset-user-traffic-calendar-month';

export const USERS_JOBS_SERVICES = [
    FindExceededUsageUsersService,
    FindExpiredUsersService,
    ResetUserTrafficService,
    ResetUserTrafficCalendarMonthService,
];
