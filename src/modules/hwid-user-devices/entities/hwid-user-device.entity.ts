import { HwidUserDevices } from '@prisma/client';

export class HwidUserDeviceEntity implements HwidUserDevices {
    hwid: string;
    userUuid: string;
    platform: string | null;
    osVersion: string | null;
    deviceModel: string | null;
    userAgent: string | null;

    createdAt: Date;
    updatedAt: Date;

    constructor(history: Partial<HwidUserDevices>) {
        Object.assign(this, history);
        return this;
    }
    deviceOS: string | null;
    versionOS: string | null;
}
