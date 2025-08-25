import { TResetPeriods, TUsersStatus } from '@libs/contracts/constants';

import { IRawHost } from '@modules/subscription-template/generators/interfaces';

import { ISubscriptionHeaders } from '../interfaces';

export class RawSubscriptionWithHostsResponse {
    public user: {
        daysLeft: number;
        expiresAt: Date;
        isActive: boolean;
        shortUuid: string;
        trafficLimit: string;
        trafficUsed: string;
        lifetimeTrafficUsed: string;
        trafficLimitBytes: string;
        trafficUsedBytes: string;
        lifetimeTrafficUsedBytes: string;
        username: string;
        userStatus: TUsersStatus;
        trafficLimitStrategy: TResetPeriods;
        tag: string | null;
    };
    public subscriptionUrl: string;
    public isHwidLimited: boolean;
    public rawHosts: IRawHost[];
    public headers: ISubscriptionHeaders;

    constructor(data: RawSubscriptionWithHostsResponse) {
        this.user = data.user;
        this.subscriptionUrl = data.subscriptionUrl;
        this.rawHosts = data.rawHosts;
        this.headers = data.headers;
        this.isHwidLimited = data.isHwidLimited;
    }
}
