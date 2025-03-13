import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { SubscriptionTemplateModule } from '@modules/subscription-template/subscription-template.module';

import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
    imports: [CqrsModule, SubscriptionTemplateModule],
    controllers: [SubscriptionController],
    providers: [SubscriptionService],
    exports: [],
})
export class SubscriptionModule {}
