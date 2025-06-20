import { InternalSquads } from '@prisma/client';

export class InternalSquadEntity implements InternalSquads {
    public uuid: string;
    public name: string;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(internalSquad: Partial<InternalSquads>) {
        Object.assign(this, internalSquad);
        return this;
    }
}
