interface IUserSubscriptionRequestHistoryRecord {
    id: number;
    userUuid: string;
    requestAt: Date;
    requestIp: string | null | undefined;
    userAgent: string | null | undefined;
}
export class GetUserSubscriptionRequestHistoryResponseModel {
    public readonly total: number;
    public readonly records: IUserSubscriptionRequestHistoryRecord[];

    constructor(data: IUserSubscriptionRequestHistoryRecord[]) {
        this.records = data;
        this.total = data.length;
    }
}
