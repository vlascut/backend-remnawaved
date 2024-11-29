import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getDateRange(timezone: string, substractDays: number = 0): [Date, Date] {
    const now = dayjs().tz(timezone);
    const start = now.startOf('day').subtract(substractDays, 'day');
    const end = now.endOf('day').subtract(substractDays, 'day');

    const startUTC = start.utc().toDate();
    const endUTC = end.utc().toDate();
    return [startUTC, endUTC];
}
