export const NODES_CONTROLLER = 'nodes' as const;

export const NODES_ROUTES = {
    CREATE: 'create',
    ENABLE: 'enable',
    RESTART: 'restart',
    RESTART_ALL: 'restart-all',

    DELETE: 'delete',
    UPDATE: 'update',
    DISABLE: 'disable',
    GET_ALL: 'get-all',
    GET_ONE: 'get-one',
    STATS: {
        USAGE_BY_RANGE: 'usage/range',
        USAGE_BY_RANGE_USER: 'usage/users/range',
        USAGE_REALTIME: 'usage/realtime',
    },
    REORDER: 'reorder',
} as const;
