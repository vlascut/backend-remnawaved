interface IBulkUpdateUsedTraffic {
    u: string;
    b: string;
    n: string;
}

export class BulkIncrementUsedTrafficCommand {
    constructor(public readonly userUsageList: IBulkUpdateUsedTraffic[]) {}
}
