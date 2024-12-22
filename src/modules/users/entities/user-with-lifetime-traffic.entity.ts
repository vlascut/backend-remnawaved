import { InboundsEntity } from 'src/modules/inbounds/entities/inbounds.entity';
import { TResetPeriods } from '@libs/contracts/constants';
import { TUsersStatus } from '@libs/contracts/constants';

import { IUserWithLifetimeTraffic } from '../interfaces';

export class UserWithLifetimeTrafficEntity {
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
    public onlineAt: Date;
    public subRevokedAt: Date | null;
    public lastTrafficResetAt: Date | null;

    public trojanPassword: string;
    public vlessUuid: string;
    public ssPassword: string;

    public createdAt: Date;
    public updatedAt: Date;

    public activeUserInbounds: InboundsEntity[];

    public totalUsedBytes: bigint;
    constructor(user: Partial<IUserWithLifetimeTraffic>) {
        Object.assign(this, user);

        if (user.activeUserInbounds) {
            this.activeUserInbounds = user.activeUserInbounds.map((item) => ({
                uuid: item.inbound.uuid,
                tag: item.inbound.tag,
                type: item.inbound.type,
            }));
        }

        return this;
    }
}
