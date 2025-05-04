import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { SubscriptionTemplateModule } from '@modules/subscription-template/subscription-template.module';

import { SubscriptionController, SubscriptionsController } from './controllers';
import { SubscriptionService } from './subscription.service';

@Module({
    imports: [CqrsModule, SubscriptionTemplateModule],
    controllers: [SubscriptionController, SubscriptionsController],
    providers: [SubscriptionService],
    exports: [],
})
export class SubscriptionModule {}
