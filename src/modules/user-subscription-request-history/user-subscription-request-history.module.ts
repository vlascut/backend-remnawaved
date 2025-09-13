import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { UserSubscriptionRequestHistoryRepository } from './repositories/user-subscription-request-history.repository';
import { UserSubscriptionRequestHistoryConverter } from './user-subscription-request-history.converter';
import { UserSubscriptionRequestHistoryService } from './user-subscription-request-history.service';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [
        UserSubscriptionRequestHistoryRepository,
        UserSubscriptionRequestHistoryConverter,
        UserSubscriptionRequestHistoryService,
        ...COMMANDS,
        ...QUERIES,
    ],
})
export class UserSubscriptionRequestHistoryModule {}
