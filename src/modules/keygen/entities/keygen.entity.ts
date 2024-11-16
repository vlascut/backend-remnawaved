import { Keygen } from '@prisma/client';

export class KeygenEntity implements Keygen {
    public uuid: string;
    public privKey: string;
    public pubKey: string;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(keygen: Partial<Keygen>) {
        Object.assign(this, keygen);
        return this;
    }
}
