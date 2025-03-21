export const USERS_CONTROLLER = 'users' as const;

export const USERS_ROUTES = {
    CREATE: '',
    GET_BY_UUID: 'uuid',
    GET_BY_SHORT_UUID: 'short-uuid',
    GET_BY_USERNAME: 'username',
    GET_BY_SUBSCRIPTION_UUID: 'sub-uuid',
    GET_ALL_V2: 'v2',
    REVOKE_SUBSCRIPTION: 'revoke',
    DISABLE_USER: 'disable',
    ENABLE_USER: 'enable',
    DELETE_USER: 'delete',
    UPDATE: 'update',
    RESET_USER_TRAFFIC: 'reset-traffic',
    BULK: {
        DELETE_BY_STATUS: 'bulk/delete-by-status',
        UPDATE: 'bulk/update',
        RESET_TRAFFIC: 'bulk/reset-traffic',
        REVOKE_SUBSCRIPTION: 'bulk/revoke-subscription',
        DELETE: 'bulk/delete',
        UPDATE_INBOUNDS: 'bulk/update-inbounds',
        ALL: {
            UPDATE: 'bulk/all/update',
            RESET_TRAFFIC: 'bulk/all/reset-traffic',
        },
    },
    GET_BY_TELEGRAM_ID: 'tg',
    GET_BY_EMAIL: 'email',
    STATS: {
        GET_USAGE_BY_RANGE: 'stats/usage/range',
    },
} as const;
