export const HOSTS_CONTROLLER = 'hosts' as const;

export const HOSTS_ROUTES = {
    CREATE: 'create',
    DELETE: 'delete',
    GET_ALL: 'all',
    UPDATE: 'update',
    UPDATE_MANY: 'many',
    REORDER: 'reorder',
    GET_ONE: 'get-one',
    BULK: {
        ENABLE_HOSTS: 'bulk/enable',
        DISABLE_HOSTS: 'bulk/disable',
        DELETE_HOSTS: 'bulk/delete',
        SET_INBOUND: 'bulk/set-inbound',
        SET_PORT: 'bulk/set-port',
    },
} as const;
