import { CronExpression } from '@nestjs/schedule';

const EVERY_15_SECONDS = '*/15 * * * * *';
const EVERY_45_SECONDS = '*/45 * * * * *';
const EVERY_WEEK_AT_MONDAY_MIDNIGHT = '0 0 * * 1';

export const JOBS_INTERVALS = {
    METRIC_SHORT_USERS_STATS: CronExpression.EVERY_MINUTE,

    NODE_HEALTH_CHECK: CronExpression.EVERY_10_SECONDS,
    RECORD_NODE_USAGE: CronExpression.EVERY_30_SECONDS,
    RESET_NODE_TRAFFIC: CronExpression.EVERY_DAY_AT_1AM,
    REVIEW_NODES: CronExpression.EVERY_HOUR,

    RECORD_USER_USAGE: CronExpression.EVERY_MINUTE,

    RESET_USER_TRAFFIC: {
        DAILY: CronExpression.EVERY_DAY_AT_MIDNIGHT,
        WEEKLY: EVERY_WEEK_AT_MONDAY_MIDNIGHT,
        MONTHLY: CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT,
    },
    REVIEW_USERS: {
        FIND_EXCEEDED_TRAFFIC_USAGE_USERS: EVERY_45_SECONDS,
        FIND_EXPIRED_USERS: CronExpression.EVERY_30_SECONDS,
    },
} as const;
