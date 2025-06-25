import { ConfigProfiles } from '@prisma/client';

export class ConfigProfileEntity implements ConfigProfiles {
    public uuid: string;
    public name: string;
    public config: object;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(configProfile: Partial<ConfigProfiles>) {
        Object.assign(this, configProfile);
        return this;
    }
}
