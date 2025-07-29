import { Query } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';

import { ConfigProfileInboundEntity } from '@modules/config-profiles/entities';

export class GetPreparedConfigWithUsersQuery extends Query<ICommandResponse<IXrayConfig>> {
    constructor(
        public readonly configProfileUuid: string,
        public readonly activeInbounds: ConfigProfileInboundEntity[],
    ) {
        super();
    }
}
