import { UserWithActiveInboundsEntity } from '@modules/users/entities/user-with-active-inbounds.entity';

export class UserEvent {
    user: UserWithActiveInboundsEntity;

    constructor(user: UserWithActiveInboundsEntity) {
        this.user = user;
    }
}
