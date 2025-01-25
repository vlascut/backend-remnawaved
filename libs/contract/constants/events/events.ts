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
        TRAFFIC_REACHED: 'user.traffic_reached',
    },
    NODE: {
        CREATED: 'node.created',
        MODIFIED: 'node.modified',
        DISABLED: 'node.disabled',
        ENABLED: 'node.enabled',
        DELETED: 'node.deleted',
        CONNECTION_LOST: 'node.connection_lost',
        CONNECTION_RESTORED: 'node.connection_restored',
        RESTARTED: 'node.restarted',
        TRAFFIC_NOTIFY: 'node.traffic_notify',
    },
    CATCH_ALL_USER_EVENTS: 'user.*',
    CATCH_ALL_NODE_EVENTS: 'node.*',
} as const;

export type TNodeEvents = (typeof EVENTS.NODE)[keyof typeof EVENTS.NODE];
export type TUserEvents = (typeof EVENTS.USER)[keyof typeof EVENTS.USER];
