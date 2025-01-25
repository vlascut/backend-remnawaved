import { catchError, firstValueFrom, retry, throwError } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { createHmac } from 'node:crypto';
import { serialize } from 'superjson';
import dayjs from 'dayjs';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces/user.event.interface';
import { NodeEvent } from '@intergration-modules/telegram-bot/events/nodes/interfaces';
import { EVENTS } from '@libs/contracts/constants';

@Injectable()
export class WebhookEvents {
    private readonly logger = new Logger(WebhookEvents.name);

    private readonly webhookUrl: string;
    private readonly webhookSecret: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.webhookUrl = this.configService.getOrThrow<string>('WEBHOOK_URL');
        this.webhookSecret = this.configService.getOrThrow<string>('WEBHOOK_SECRET_HEADER');
    }

    @OnEvent(EVENTS.CATCH_ALL_USER_EVENTS)
    async onUserExpired(event: UserEvent): Promise<void> {
        try {
            const payload = {
                event: event.eventName,
                timestamp: dayjs().toISOString(),
                data: instanceToPlain(event.user),
            };

            const { json } = serialize(payload);

            const signature = createHmac('sha256', this.webhookSecret)
                .update(JSON.stringify(json))
                .digest('hex');

            await firstValueFrom(
                this.httpService
                    .post(this.webhookUrl, json, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Remnwave-Signature': signature,
                            'X-Remnwave-Timestamp': payload.timestamp,
                            'User-Agent': 'Remnwave',
                        },
                    })
                    .pipe(
                        retry({
                            count: 3,
                            delay: 1000,
                        }),
                        catchError((error) =>
                            throwError(
                                () =>
                                    new Error(
                                        `Failed to send webhook after 3 retries: ${error.message}`,
                                    ),
                            ),
                        ),
                    ),
            );
        } catch (error) {
            this.logger.error(`Error sending webhook event: ${error}`);
        }
    }

    @OnEvent(EVENTS.CATCH_ALL_NODE_EVENTS)
    async onNodeEvent(event: NodeEvent): Promise<void> {
        try {
            const payload = {
                event: event.eventName,
                timestamp: dayjs().toISOString(),
                data: instanceToPlain(event.node),
            };

            const { json } = serialize(payload);

            const signature = createHmac('sha256', this.webhookSecret)
                .update(JSON.stringify(json))
                .digest('hex');

            await firstValueFrom(
                this.httpService
                    .post(this.webhookUrl, json, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Remnwave-Signature': signature,
                            'X-Remnwave-Timestamp': payload.timestamp,
                            'User-Agent': 'Remnwave',
                        },
                    })
                    .pipe(
                        retry({
                            count: 3,
                            delay: 1000,
                        }),
                        catchError((error) =>
                            throwError(
                                () =>
                                    new Error(
                                        `Failed to send webhook after 3 retries: ${error.message}`,
                                    ),
                            ),
                        ),
                    ),
            );
        } catch (error) {
            this.logger.error(`Error sending webhook event: ${error}`);
        }
    }
}
