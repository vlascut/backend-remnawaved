import { Query } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

import { ConfigProfileWithInboundsAndNodesEntity } from '@modules/config-profiles/entities';

export class GetConfigProfileByUuidQuery extends Query<
    ICommandResponse<ConfigProfileWithInboundsAndNodesEntity>
> {
    constructor(public readonly uuid: string) {
        super();
    }
}
