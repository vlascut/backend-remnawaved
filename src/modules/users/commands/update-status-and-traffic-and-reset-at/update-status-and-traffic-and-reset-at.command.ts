import { TUsersStatus } from '../../../../../libs/contract/constants';

export class UpdateStatusAndTrafficAndResetAtCommand {
    constructor(
        public readonly userUuid: string,
        public readonly lastResetAt: Date,
        public readonly status?: TUsersStatus,
    ) {}
}
