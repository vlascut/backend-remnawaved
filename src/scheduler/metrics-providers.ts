import { makeCounterProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';

import { METRIC_NAMES } from '@libs/contracts/constants';

export const METRIC_PROVIDERS = [
    makeGaugeProvider({
        name: METRIC_NAMES.NODE_ONLINE_USERS,
        help: 'Number of online users on a node',
        labelNames: ['node_uuid', 'node_name', 'node_country_emoji', 'provider_name'],
    }),
    makeGaugeProvider({
        name: METRIC_NAMES.NODE_STATUS,
        help: 'Node connection status (1 - connected, 0 - disconnected)',
        labelNames: ['node_uuid', 'node_name', 'node_country_emoji', 'provider_name'],
    }),
    makeGaugeProvider({
        name: METRIC_NAMES.USERS_STATUS,
        help: 'Counter for users statuses, updated every 1 minute',
        labelNames: ['status'],
    }),
    makeGaugeProvider({
        name: METRIC_NAMES.USERS_TOTAL,
        help: 'Total number of users, updated every 1 minute',
        labelNames: ['type'],
    }),
    makeCounterProvider({
        name: METRIC_NAMES.NODE_INBOUND_UPLOAD_BYTES,
        help: 'Inbound upload bytes, updated every 30 seconds',
        labelNames: ['node_uuid', 'node_name', 'node_country_emoji', 'tag', 'provider_name'],
    }),
    makeCounterProvider({
        name: METRIC_NAMES.NODE_INBOUND_DOWNLOAD_BYTES,
        help: 'Inbound download bytes, updated every 30 seconds',
        labelNames: ['node_uuid', 'node_name', 'node_country_emoji', 'tag', 'provider_name'],
    }),
    makeCounterProvider({
        name: METRIC_NAMES.NODE_OUTBOUND_UPLOAD_BYTES,
        help: 'Outbound upload bytes, updated every 30 seconds',
        labelNames: ['node_uuid', 'node_name', 'node_country_emoji', 'tag', 'provider_name'],
    }),
    makeCounterProvider({
        name: METRIC_NAMES.NODE_OUTBOUND_DOWNLOAD_BYTES,
        help: 'Outbound download bytes, updated every 30 seconds',
        labelNames: ['node_uuid', 'node_name', 'node_country_emoji', 'tag', 'provider_name'],
    }),
];
