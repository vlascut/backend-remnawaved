import { CronExpression } from '@nestjs/schedule';

const EVERY_15_SECONDS = '*/15 * * * * *';

export const JOBS_INTERVALS = {
    NODE_HEALTH_CHECK: CronExpression.EVERY_10_SECONDS,
    RECORD_NODE_USAGE: CronExpression.EVERY_30_SECONDS,
    RECORD_USER_USAGE: EVERY_15_SECONDS,
    REVIEW_USERS: CronExpression.EVERY_10_SECONDS,
    RESET_USER_TRAFFIC: CronExpression.EVERY_MINUTE,
    RESET_NODE_TRAFFIC: CronExpression.EVERY_DAY_AT_11PM,
} as const;
