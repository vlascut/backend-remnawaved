export const EVENTS = {
    USER: {
        CREATED: 'user.created',
        MODIFIED: 'user.modified',
        DELETED: 'user.deleted',
        REVOKED: 'user.revoked',
        DISABLED: 'user.disabled',
        ENABLED: 'user.enabled',
        LIMITED: 'user.limited',
        EXPIRED: 'user.expired',
        TRAFFIC_RESET: 'user.traffic_reset',
        EXPIRE_NOTIFY: {
            EXPIRES_IN_72_HOURS: 'user.expires_in_72_hours',
            EXPIRES_IN_48_HOURS: 'user.expires_in_48_hours',
            EXPIRES_IN_24_HOURS: 'user.expires_in_24_hours',
            EXPIRED_24_HOURS_AGO: 'user.expired_24_hours_ago',
        },
    },
    NODE: {
        CREATED: 'node.created',
        MODIFIED: 'node.modified',
        DISABLED: 'node.disabled',
        ENABLED: 'node.enabled',
        DELETED: 'node.deleted',
        CONNECTION_LOST: 'node.connection_lost',
        CONNECTION_RESTORED: 'node.connection_restored',
        TRAFFIC_NOTIFY: 'node.traffic_notify',
    },
    CATCH_ALL_USER_EVENTS: 'user.*',
    CATCH_ALL_NODE_EVENTS: 'node.*',
} as const;

export type TNodeEvents = (typeof EVENTS.NODE)[keyof typeof EVENTS.NODE];
export type TUserEvents = (typeof EVENTS.USER)[keyof typeof EVENTS.USER];
