import { TUsersStatus } from '../../../../libs/contract';

export class SubscriptionRawResponse {
    public isFound: boolean;
    public user: {
        shortUuid: string;
        daysLeft: number;
        trafficUsed: string;
        trafficLimit: string;
        username: string;
        expiresAt: Date;
        isActive: boolean;
        userStatus: TUsersStatus;
    };

    constructor(data: SubscriptionRawResponse) {
        this.isFound = data.isFound;
        this.user = data.user;
    }
}
