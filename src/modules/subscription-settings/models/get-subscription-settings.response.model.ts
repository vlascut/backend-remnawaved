import { SubscriptionSettingsEntity } from '../entities/subscription-settings.entity';

export class SubscriptionSettingsResponseModel {
    public uuid: string;
    public profileTitle: string;
    public supportLink: string;
    public profileWebpageUrl: string;
    public profileUpdateInterval: number;
    public happAnnounce: string | null;
    public happRouting: string | null;
    public expiredUsersRemarks: string[];
    public limitedUsersRemarks: string[];
    public disabledUsersRemarks: string[];

    public createdAt: Date;
    public updatedAt: Date;

    constructor(entity: SubscriptionSettingsEntity) {
        this.uuid = entity.uuid;
        this.profileTitle = entity.profileTitle;
        this.supportLink = entity.supportLink;
        this.profileWebpageUrl = entity.profileWebpageUrl;
        this.profileUpdateInterval = entity.profileUpdateInterval;
        this.happAnnounce = entity.happAnnounce;
        this.happRouting = entity.happRouting;
        this.expiredUsersRemarks = entity.expiredUsersRemarks;
        this.limitedUsersRemarks = entity.limitedUsersRemarks;
        this.disabledUsersRemarks = entity.disabledUsersRemarks;
        this.createdAt = entity.createdAt;
        this.updatedAt = entity.updatedAt;
    }
}
