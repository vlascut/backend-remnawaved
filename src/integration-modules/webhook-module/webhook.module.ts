import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { WEBHOOK_EVENTS } from './events';

@Module({
    imports: [HttpModule, CqrsModule, ConfigModule],
    controllers: [],
    providers: [...WEBHOOK_EVENTS],
})
export class WebhookModule {}
