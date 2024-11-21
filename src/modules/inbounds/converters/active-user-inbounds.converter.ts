import { Injectable } from '@nestjs/common';
import { UniversalConverter } from '@common/converter/universalConverter';
import { ActiveUserInbounds } from '@prisma/client';

import { ActiveUserInboundEntity } from '../entities/active-user-inbound.entity';

const modelToEntity = (model: ActiveUserInbounds): ActiveUserInboundEntity => {
    return new ActiveUserInboundEntity(model);
};

const entityToModel = (entity: ActiveUserInboundEntity): ActiveUserInbounds => {
    return {
        uuid: entity.uuid,
        userUuid: entity.userUuid,
        inboundUuid: entity.inboundUuid,
    };
};

@Injectable()
export class ActiveUserInboundsConverter extends UniversalConverter<
    ActiveUserInboundEntity,
    ActiveUserInbounds
> {
    constructor() {
        super(modelToEntity, entityToModel);
    }
}
