import { Users } from '@prisma/client';

export class UserEntity implements Users {
    uuid: string;
    subscriptionUuid: string;
    shortUuid: string;
    username: string;
    status: string;
    usedTrafficBytes: number;
    trafficLimitBytes: number;
    trafficLimitStrategy: string;
    subLastUserAgent: string;
    subLastIp: string;

    expireAt: Date;
    onlineAt: Date;
    subRevokedAt: Date | null;

    createdAt: Date;
    updatedAt: Date;

    constructor(user: Partial<Users>) {
        Object.assign(this, user);
        return this;
    }
}
