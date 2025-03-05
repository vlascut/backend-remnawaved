import { ResetUserTrafficCalendarMonthService } from './reset-user-traffic-month';
import { ResetUserTrafficCalendarWeekService } from './reset-user-traffic-week';
import { ResetUserTrafficCalendarDayService } from './reset-user-traffic-day';

export const RESET_USER_TRAFFIC_JOBS = [
    ResetUserTrafficCalendarMonthService,
    ResetUserTrafficCalendarWeekService,
    ResetUserTrafficCalendarDayService,
];
