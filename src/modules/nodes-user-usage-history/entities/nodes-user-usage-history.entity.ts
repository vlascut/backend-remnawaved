import { NodesUserUsageHistory } from '@prisma/client';

export class NodesUserUsageHistoryEntity implements NodesUserUsageHistory {
    uuid: string;
    nodeUuid: string;
    userUuid: string;
    downloadBytes: bigint;
    uploadBytes: bigint;
    totalBytes: bigint;
    createdAt: Date;

    constructor(history: Partial<NodesUserUsageHistory>) {
        Object.assign(this, history);
        return this;
    }
}
