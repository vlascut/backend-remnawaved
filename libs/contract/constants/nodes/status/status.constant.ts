export const NODES_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    DISABLED: 'disabled',
} as const;

export type TNodesStatus = [keyof typeof NODES_STATUS][number];
export const NODES_STATUS_VALUES = Object.values(NODES_STATUS);
