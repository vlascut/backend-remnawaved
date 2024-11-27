import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';

export class ReaddUserToNodeEvent {
    constructor(
        public readonly user: UserWithActiveInboundsEntity,
        public readonly oldInboundTags: string[],
    ) {}
}
