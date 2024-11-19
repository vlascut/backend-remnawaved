import { XrayConfig } from '@prisma/client';

export class XrayConfigEntity implements XrayConfig {
    uuid: string;
    config: object | null;
    updatedAt: Date;

    constructor(config: Partial<XrayConfig>) {
        Object.assign(this, config);
        return this;
    }
}
