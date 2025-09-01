import { IRawHost } from '@modules/subscription-template/generators/interfaces';
import { GetUserResponseModel } from '@modules/users/models';

import { ISubscriptionHeaders } from '../interfaces';

export class RawSubscriptionWithHostsResponse {
    public user: GetUserResponseModel;
    public convertedUserInfo: {
        daysLeft: number;
        trafficLimit: string;
        trafficUsed: string;
        lifetimeTrafficUsed: string;
    };
    public isHwidLimited: boolean;
    public rawHosts: IRawHost[];
    public headers: ISubscriptionHeaders;

    constructor(data: RawSubscriptionWithHostsResponse) {
        this.user = data.user;
        this.rawHosts = data.rawHosts;
        this.headers = data.headers;
        this.isHwidLimited = data.isHwidLimited;
    }
}
