import { Query } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

export class GetAffectedConfigProfilesBySquadUuidQuery extends Query<ICommandResponse<string[]>> {
    constructor(public readonly internalSquadUuid: string) {
        super();
    }
}
