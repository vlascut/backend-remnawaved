import { InboundsEntity } from '../entities/inbounds.entity';

export class GetInboundsResponseModel {
    public tag: string;
    public uuid: string;
    public type: string;

    constructor(inboundsEntity: InboundsEntity) {
        this.tag = inboundsEntity.tag;
        this.uuid = inboundsEntity.uuid;
        this.type = inboundsEntity.type;
    }
}
