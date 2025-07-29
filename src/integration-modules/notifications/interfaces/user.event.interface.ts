import { TUserEvents } from '@libs/contracts/constants';

import { UserEntity } from '@modules/users/entities';

export class UserEvent {
    user: UserEntity;
    eventName: TUserEvents;
    skipTelegramNotification?: boolean;

    constructor(user: UserEntity, event: TUserEvents, skipTelegramNotification?: boolean) {
        this.user = user;
        this.eventName = event;
        this.skipTelegramNotification = skipTelegramNotification ?? false;
    }
}
