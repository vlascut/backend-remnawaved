import { UserWithActiveInboundsEntity } from '../../users/entities/user-with-active-inbounds.entity';

interface SubscriptionUserInfo {
    upload: number;
    download: number;
    total: number;
    expire: number;
}

export function getSubscriptionUserInfo(user: UserWithActiveInboundsEntity): SubscriptionUserInfo {
    return {
        upload: 0,
        download: Number(user.usedTrafficBytes),
        total: Number(user.trafficLimitBytes),
        expire: Math.floor(user.expireAt.getTime() / 1000),
    };
}
