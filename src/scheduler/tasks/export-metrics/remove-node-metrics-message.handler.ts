import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge } from 'prom-client';

import { IMessageHandler, MessageHandler, MessageResponse } from '@nestjstools/messaging';
import { Injectable, Logger } from '@nestjs/common';

import { MessagingMessages, METRIC_NAMES } from '@libs/contracts/constants';

import { RemoveNodeMetricsMessage } from './node-metrics.message.interface';

@Injectable()
@MessageHandler(MessagingMessages.REMOVE_NODE_METRICS)
export class RemoveNodeMetricsMessageHandler implements IMessageHandler<RemoveNodeMetricsMessage> {
    private readonly logger = new Logger(RemoveNodeMetricsMessageHandler.name);

    constructor(
        @InjectMetric(METRIC_NAMES.NODE_INBOUND_UPLOAD_BYTES)
        public nodeInboundUploadBytes: Counter<string>,
        @InjectMetric(METRIC_NAMES.NODE_INBOUND_DOWNLOAD_BYTES)
        public nodeInboundDownloadBytes: Counter<string>,
        @InjectMetric(METRIC_NAMES.NODE_OUTBOUND_UPLOAD_BYTES)
        public nodeOutboundUploadBytes: Counter<string>,
        @InjectMetric(METRIC_NAMES.NODE_OUTBOUND_DOWNLOAD_BYTES)
        public nodeOutboundDownloadBytes: Counter<string>,
        @InjectMetric(METRIC_NAMES.NODE_ONLINE_USERS)
        public nodeOnlineUsers: Gauge<string>,
        @InjectMetric(METRIC_NAMES.NODE_STATUS)
        public nodeStatus: Gauge<string>,
    ) {}

    async handle(): Promise<MessageResponse> {
        try {
            this.nodeOnlineUsers.remove({});
            this.nodeStatus.remove({});
            this.nodeInboundUploadBytes.remove({});
            this.nodeInboundDownloadBytes.remove({});
            this.nodeOutboundUploadBytes.remove({});
            this.nodeOutboundDownloadBytes.remove({});

            return new MessageResponse([{ result: 'OK' }]);
        } catch (error) {
            this.logger.error(`Error in handle: ${error}`);

            return new MessageResponse([{ result: 'ERROR' }]);
        }
    }
}
