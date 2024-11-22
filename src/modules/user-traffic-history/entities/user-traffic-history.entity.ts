import { UserTrafficHistory } from '@prisma/client';

export class UserTrafficHistoryEntity implements UserTrafficHistory {
    uuid: string;
    userUuid: string;
    usedBytes: bigint;
    resetAt: Date;
    createdAt: Date;

    constructor(history: Partial<UserTrafficHistory>) {
        Object.assign(this, history);
        return this;
    }
}
