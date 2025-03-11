import { SubscriptionSettings } from '@prisma/client';

import { Injectable } from '@nestjs/common';

import { UniversalConverter } from '@common/converter/universalConverter';

import { SubscriptionSettingsEntity } from './entities/subscription-settings.entity';

const modelToEntity = (model: SubscriptionSettings): SubscriptionSettingsEntity => {
    return new SubscriptionSettingsEntity(model);
};

const entityToModel = (entity: SubscriptionSettingsEntity): SubscriptionSettings => {
    return {
        uuid: entity.uuid,
        profileTitle: entity.profileTitle,
        supportLink: entity.supportLink,
        profileWebpageUrl: entity.profileWebpageUrl,
        profileUpdateInterval: entity.profileUpdateInterval,

        happAnnounce: entity.happAnnounce,
        happRouting: entity.happRouting,

        expiredUsersRemarks: entity.expiredUsersRemarks,
        limitedUsersRemarks: entity.limitedUsersRemarks,
        disabledUsersRemarks: entity.disabledUsersRemarks,

        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    };
};

@Injectable()
export class SubscriptionSettingsConverter extends UniversalConverter<
    SubscriptionSettingsEntity,
    SubscriptionSettings
> {
    constructor() {
        super(modelToEntity, entityToModel);
    }
}
