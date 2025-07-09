export const METRIC_NAMES = {
    NODE_ONLINE_USERS: 'node_online_users',
    NODE_STATUS: 'node_status',
    USERS_STATUS: 'users_status',
    USERS_TOTAL: 'users_total',
    NODE_INBOUND_UPLOAD_BYTES: 'node_inbound_upload_bytes',
    NODE_INBOUND_DOWNLOAD_BYTES: 'node_inbound_download_bytes',
    NODE_OUTBOUND_UPLOAD_BYTES: 'node_outbound_upload_bytes',
    NODE_OUTBOUND_DOWNLOAD_BYTES: 'node_outbound_download_bytes',
} as const;

export type TMetricNames = typeof METRIC_NAMES;
export type TMetricNamesKeys = (typeof METRIC_NAMES)[keyof typeof METRIC_NAMES];
