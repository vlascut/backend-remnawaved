import { Query } from '@nestjs/cqrs';

import { IHashPayload } from '@remnawave/node-contract';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';

import { ConfigProfileInboundEntity } from '@modules/config-profiles/entities';

export interface IGetPreparedConfigWithUsersResponse {
    config: IXrayConfig;
    hashes: IHashPayload;
}

export class GetPreparedConfigWithUsersQuery extends Query<
    ICommandResponse<IGetPreparedConfigWithUsersResponse>
> {
    constructor(
        public readonly configProfileUuid: string,
        public readonly activeInbounds: ConfigProfileInboundEntity[],
    ) {
        super();
    }
}
