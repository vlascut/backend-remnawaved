import { TUsersStatus } from '@libs/contracts/constants';

export class SubscriptionRawResponse {
    public isFound: boolean;
    public user: {
        daysLeft: number;
        expiresAt: Date;
        isActive: boolean;
        shortUuid: string;
        trafficLimit: string;
        trafficUsed: string;
        username: string;
        userStatus: TUsersStatus;
    };

    constructor(data: SubscriptionRawResponse) {
        this.isFound = data.isFound;
        this.user = data.user;
    }
}
