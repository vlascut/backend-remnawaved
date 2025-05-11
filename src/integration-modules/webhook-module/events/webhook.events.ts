import { instanceToPlain } from 'class-transformer';
import { serialize } from 'superjson';
import dayjs from 'dayjs';

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EVENTS } from '@libs/contracts/constants';

import { ServiceEvent } from '@integration-modules/telegram-bot/events/service/interfaces';
import { UserEvent } from '@integration-modules/telegram-bot/events/users/interfaces';
import { NodeEvent } from '@integration-modules/telegram-bot/events/nodes/interfaces';

import { WebhookLoggerQueueService } from '@queue/loggers/webhook-logger/webhook-logger.service';
@Injectable()
export class WebhookEvents {
    private readonly logger = new Logger(WebhookEvents.name);

    constructor(private readonly webhookLoggerQueueService: WebhookLoggerQueueService) {}

    @OnEvent(EVENTS.CATCH_ALL_USER_EVENTS)
    async onCatchAllUserEvents(event: UserEvent): Promise<void> {
        try {
            const payload = {
                event: event.eventName,
                timestamp: dayjs().toISOString(),
                data: instanceToPlain(event.user),
            };

            const { json } = serialize(payload);

            await this.webhookLoggerQueueService.sendWebhook({
                payload: JSON.stringify(json),
                timestamp: payload.timestamp,
            });
        } catch (error) {
            this.logger.error(`Error sending webhook event: ${error}`);
        }
    }

    @OnEvent(EVENTS.CATCH_ALL_NODE_EVENTS)
    async onCatchAllNodeEvents(event: NodeEvent): Promise<void> {
        try {
            const payload = {
                event: event.eventName,
                timestamp: dayjs().toISOString(),
                data: instanceToPlain(event.node),
            };

            const { json } = serialize(payload);

            await this.webhookLoggerQueueService.sendWebhook({
                payload: JSON.stringify(json),
                timestamp: payload.timestamp,
            });
        } catch (error) {
            this.logger.error(`Error sending webhook event: ${error}`);
        }
    }

    @OnEvent(EVENTS.CATCH_ALL_SERVICE_EVENTS)
    async onCatchAllServiceEvents(event: ServiceEvent): Promise<void> {
        try {
            const payload = {
                event: event.eventName,
                timestamp: dayjs().toISOString(),
                data: instanceToPlain(event),
            };

            const { json } = serialize(payload);

            await this.webhookLoggerQueueService.sendWebhook({
                payload: JSON.stringify(json),
                timestamp: payload.timestamp,
            });
        } catch (error) {
            this.logger.error(`Error sending webhook event: ${error}`);
        }
    }
}
