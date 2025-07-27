import { InfraBillingNodesNotificationsTask } from './crm/infra-billing-nodes-notifications/infra-billing-nodes-notifications.task';
import { RemoveNodeMetricsMessageHandler } from './export-metrics/remove-node-metrics-message.handler';
import { NodeMetricsMessageHandler } from './export-metrics/node-metrics-message.handler';
import { ResetNodeTrafficTask } from './reset-node-traffic/reset-node-traffic.service';
import { ExportMetricsTask } from './export-metrics/export-metrics.task';
import { ReviewNodesTask } from './review-nodes/review-nodes.task';

export const JOBS_SERVICES = [
    ResetNodeTrafficTask,
    ReviewNodesTask,
    ExportMetricsTask,
    InfraBillingNodesNotificationsTask,
];

export const MESSAGE_HANDLERS = [NodeMetricsMessageHandler, RemoveNodeMetricsMessageHandler];
