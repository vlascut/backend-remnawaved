export const SYSTEM_CONTROLLER = 'system' as const;

export const SYSTEM_ROUTES = {
    STATS: {
        SYSTEM_STATS: 'stats',
        BANDWIDTH_STATS: 'stats/bandwidth',
        NODES_STATS: 'stats/nodes',
        NODES_METRICS: 'nodes/metrics',
    },
    HEALTH: 'health',
} as const;
