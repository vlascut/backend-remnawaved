import { TUserEvents } from '@libs/contracts/constants';

import { UserWithActiveInboundsEntity } from '@modules/users/entities/user-with-active-inbounds.entity';

export class UserEvent {
    user: UserWithActiveInboundsEntity;
    eventName: TUserEvents;

    constructor(user: UserWithActiveInboundsEntity, event: TUserEvents) {
        this.user = user;
        this.eventName = event;
    }
}
