import { Query } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

import { UserSubscriptionRequestHistoryEntity } from '@modules/user-subscription-request-history/entities';

export class GetUserSubscriptionRequestHistoryQuery extends Query<
    ICommandResponse<UserSubscriptionRequestHistoryEntity[]>
> {
    constructor(public readonly userUuid: string) {
        super();
    }
}
