import { Injectable } from '@nestjs/common';
import { UniversalConverter } from '@common/converter/universalConverter';
import { Inbounds } from '@prisma/client';
import { InboundsEntity } from './entities/inbounds.entity';

const modelToEntity = (model: Inbounds): InboundsEntity => {
    return new InboundsEntity(model);
};

const entityToModel = (entity: InboundsEntity): Inbounds => {
    return {
        uuid: entity.uuid,
        tag: entity.tag,
    };
};

@Injectable()
export class InboundsConverter extends UniversalConverter<InboundsEntity, Inbounds> {
    constructor() {
        super(modelToEntity, entityToModel);
    }
}
