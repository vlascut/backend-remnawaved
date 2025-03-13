interface IBulkUpdateUsedTraffic {
    userUuid: string;
    bytes: bigint;
}

export class BulkIncrementUsedTrafficCommand {
    constructor(public readonly userUsageList: IBulkUpdateUsedTraffic[]) {}
}
