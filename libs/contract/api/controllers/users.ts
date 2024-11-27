export const USERS_CONTROLLER = 'users' as const;

export const USERS_ROUTES = {
    CREATE: '',
    GET_BY_UUID: '',
    GET_BY_SHORT_UUID: 'short-uuid/:shortUuid',
    GET_BY_SUBSCRIPTION_UUID: 'sub-uuid/:subscriptionUuid',
    GET_ALL: '',
    REVOKE_SUBSCRIPTION: 'revoke/:uuid',
    DISABLE_USER: 'disable/:uuid',
    ENABLE_USER: 'enable/:uuid',
    DELETE_USER: 'delete/:uuid',
    UPDATE: 'update',
} as const;
