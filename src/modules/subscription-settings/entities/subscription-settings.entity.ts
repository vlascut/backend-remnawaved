import { SubscriptionSettings } from '@prisma/client';

export class SubscriptionSettingsEntity implements SubscriptionSettings {
    uuid: string;
    profileTitle: string;
    supportLink: string;
    profileWebpageUrl: string;
    profileUpdateInterval: number;

    happAnnounce: string | null;
    happRouting: string | null;

    expiredUsersRemarks: string[];
    limitedUsersRemarks: string[];
    disabledUsersRemarks: string[];

    createdAt: Date;
    updatedAt: Date;
    constructor(config: Partial<SubscriptionSettings>) {
        Object.assign(this, config);
        return this;
    }
}
