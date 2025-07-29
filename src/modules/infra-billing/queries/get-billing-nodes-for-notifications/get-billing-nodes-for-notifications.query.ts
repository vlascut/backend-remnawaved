import { Query } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

import { InfraBillingNodeNotificationEntity } from '@modules/infra-billing/entities';

export class GetBillingNodesForNotificationsQuery extends Query<
    ICommandResponse<InfraBillingNodeNotificationEntity[]>
> {
    constructor() {
        super();
    }
}
