export const NODES_CONTROLLER = 'nodes' as const;

export const NODES_ROUTES = {
    CREATE: 'create',
    DELETE: 'delete',
    UPDATE: 'update',

    DISABLE: 'disable',
    ENABLE: 'enable',
    RESTART: 'restart',
    RESTART_ALL: 'restart-all',

    GET_ALL: 'get-all',
    GET_ONE: 'get-one',
} as const;
