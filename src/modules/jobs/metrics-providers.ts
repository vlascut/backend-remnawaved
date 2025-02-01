import { METRIC_NAMES } from '@libs/contracts/constants';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const METRIC_PROVIDERS = [
    makeGaugeProvider({
        name: METRIC_NAMES.NODE_ONLINE_USERS,
        help: 'Number of online users on a node',
        labelNames: ['node_uuid', 'node_name'],
    }),
    makeGaugeProvider({
        name: METRIC_NAMES.NODE_STATUS,
        help: 'Node connection status (1 - connected, 0 - disconnected)',
        labelNames: ['node_uuid', 'node_name'],
    }),
];
