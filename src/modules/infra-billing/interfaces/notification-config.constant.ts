import dayjs from 'dayjs';

export const NOTIFICATION_CONFIGS = {
    INFRA_BILLING_NODE_PAYMENT_IN_7_DAYS: {
        from: () => dayjs().add(6, 'days').toDate(),
        to: () => dayjs().add(7, 'days').toDate(),
    },
    INFRA_BILLING_NODE_PAYMENT_IN_48HRS: {
        from: () => dayjs().add(1, 'day').toDate(),
        to: () => dayjs().add(2, 'days').toDate(),
    },
    INFRA_BILLING_NODE_PAYMENT_IN_24HRS: {
        from: () => dayjs().toDate(),
        to: () => dayjs().add(1, 'day').toDate(),
    },
    INFRA_BILLING_NODE_PAYMENT_DUE_TODAY: {
        from: () => dayjs().startOf('day').toDate(),
        to: () => dayjs().add(1, 'day').startOf('day').toDate(),
    },
    INFRA_BILLING_NODE_PAYMENT_OVERDUE_24HRS: {
        from: () => dayjs().subtract(1, 'day').toDate(),
        to: () => dayjs().startOf('day').toDate(),
    },
    INFRA_BILLING_NODE_PAYMENT_OVERDUE_48HRS: {
        from: () => dayjs().subtract(2, 'days').toDate(),
        to: () => dayjs().subtract(1, 'day').toDate(),
    },
    INFRA_BILLING_NODE_PAYMENT_OVERDUE_7_DAYS: {
        from: () => dayjs().subtract(7, 'days').toDate(),
        to: () => dayjs().subtract(2, 'days').toDate(),
    },
} as const;

export type TBillingNodeNotificationType = keyof typeof NOTIFICATION_CONFIGS;
