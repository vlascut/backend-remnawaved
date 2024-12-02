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

export function getLastTwoWeeksRanges(timezone: string): [[Date, Date], [Date, Date]] {
    const now = dayjs().tz(timezone);

    // Текущая неделя
    const currentEnd = now.endOf('day');
    const currentStart = now.subtract(6, 'days').startOf('day');

    // Предыдущая неделя (смещение на 7 дней назад)
    const previousEnd = currentStart.subtract(1, 'day').endOf('day');
    const previousStart = previousEnd.subtract(6, 'days').startOf('day');

    return [
        [previousStart.utc().toDate(), previousEnd.utc().toDate()], // предыдущая неделя
        [currentStart.utc().toDate(), currentEnd.utc().toDate()], // текущая неделя
    ];
}
