import { Inbounds } from '@prisma/client';

export class InboundsEntity implements Inbounds {
    uuid: string;
    tag: string;

    constructor(inbound: Partial<Inbounds>) {
        Object.assign(this, inbound);
        return this;
    }
}
