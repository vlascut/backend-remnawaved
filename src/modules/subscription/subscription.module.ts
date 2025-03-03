import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { ConfigTemplatesService } from './config-templates.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
    imports: [CqrsModule],
    controllers: [SubscriptionController],
    providers: [SubscriptionService, ConfigTemplatesService],
    exports: [ConfigTemplatesService],
})
export class SubscriptionModule {}
