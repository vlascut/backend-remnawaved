import { Command } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

import { UserSubscriptionRequestHistoryEntity } from '@modules/user-subscription-request-history';

export class CreateSubscriptionRequestHistoryCommand extends Command<
    ICommandResponse<{
        userSubscriptionRequestHistory: UserSubscriptionRequestHistoryEntity;
    }>
> {
    constructor(
        public readonly userSubscriptionRequestHistory: UserSubscriptionRequestHistoryEntity,
    ) {
        super();
    }
}
