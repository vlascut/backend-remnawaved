import { Injectable, Logger } from '@nestjs/common';

import { UserSubscriptionRequestHistoryRepository } from './repositories/user-subscription-request-history.repository';

@Injectable()
export class UserSubscriptionRequestHistoryService {
    private readonly logger = new Logger(UserSubscriptionRequestHistoryService.name);
    constructor(
        private readonly userSubscriptionRequestHistoryRepository: UserSubscriptionRequestHistoryRepository,
    ) {}
}
