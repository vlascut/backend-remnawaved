export class GetSubscriptionRequestHistoryStatsResponseModel {
    public readonly byParsedApp: { app: string; count: number }[];

    constructor(data: GetSubscriptionRequestHistoryStatsResponseModel) {
        this.byParsedApp = data.byParsedApp;
    }
}
