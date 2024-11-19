export const NODES_CYCLE = {
    MONTH: 'month',
    YEAR: 'year',
} as const;

export type TNodesCycle = [keyof typeof NODES_CYCLE][number];
export const NODES_CYCLE_VALUES = Object.values(NODES_CYCLE);
