import { Query } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

import { UserWithResolvedInboundEntity } from '@modules/users/entities';

export class GetUserWithResolvedInboundsQuery extends Query<
    ICommandResponse<UserWithResolvedInboundEntity>
> {
    constructor(public readonly userUuid: string) {
        super();
    }
}
