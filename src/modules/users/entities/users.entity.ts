import { Users } from '@prisma/client';
import { TResetPeriods, TUsersStatus } from '@contract/constants';
export class UserEntity implements Users {
    uuid: string;
    subscriptionUuid: string;
    shortUuid: string;
    username: string;
    status: TUsersStatus;
    usedTrafficBytes: bigint;
    trafficLimitBytes: bigint;
    trafficLimitStrategy: TResetPeriods;
    subLastUserAgent: string;
    subLastOpenedAt: Date;

    expireAt: Date;
    onlineAt: Date;
    subRevokedAt: Date | null;
    lastTrafficResetAt: Date | null;

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
