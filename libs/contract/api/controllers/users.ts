export const USERS_CONTROLLER = 'users' as const;

export const USERS_ROUTES = {
    CREATE: '',
    GET_BY_UUID: 'uuid',
    GET_BY_SHORT_UUID: 'short-uuid',
    GET_BY_SUBSCRIPTION_UUID: 'sub-uuid',
    GET_ALL: '',
    REVOKE_SUBSCRIPTION: 'revoke',
    DISABLE_USER: 'disable',
    ENABLE_USER: 'enable',
    DELETE_USER: 'delete',
    UPDATE: 'update',
} as const;
