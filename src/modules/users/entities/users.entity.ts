import { Users } from '@prisma/client';
import { TResetPeriods, TUsersStatus } from '@contract/constants';
export class UserEntity implements Users {
    uuid: string;
    subscriptionUuid: string;
    shortUuid: string;
    username: string;
    status: TUsersStatus;
    usedTrafficBytes: number;
    trafficLimitBytes: number;
    trafficLimitStrategy: TResetPeriods;
    subLastUserAgent: string;
    subLastIp: string;

    expireAt: Date;
    onlineAt: Date;
    subRevokedAt: Date | null;

    trojanPassword: string;
    vlessUuid: string;
    ssPassword: string;

    createdAt: Date;
    updatedAt: Date;

    constructor(user: Partial<Users>) {
        Object.assign(this, user);
        return this;
    }
}
