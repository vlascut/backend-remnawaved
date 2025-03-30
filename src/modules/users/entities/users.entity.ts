import { Users } from '@prisma/client';

import { TResetPeriods, TUsersStatus } from '@contract/constants';

export class UserEntity implements Users {
    public uuid: string;
    public subscriptionUuid: string;
    public shortUuid: string;
    public username: string;
    public status: TUsersStatus;
    public usedTrafficBytes: bigint;
    public lifetimeUsedTrafficBytes: bigint;

    public trafficLimitBytes: bigint;
    public trafficLimitStrategy: TResetPeriods;
    public subLastUserAgent: string;
    public subLastOpenedAt: Date;

    public expireAt: Date;
    public onlineAt: Date | null;
    public subRevokedAt: Date | null;
    public lastTrafficResetAt: Date | null;

    public trojanPassword: string;
    public vlessUuid: string;
    public ssPassword: string;

    public description: null | string;
    public telegramId: bigint | null;
    public email: string | null;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(user: Partial<Users>) {
        Object.assign(this, user);
        return this;
    }
}
