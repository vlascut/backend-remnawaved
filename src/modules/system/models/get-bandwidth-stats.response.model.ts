export class GetBandwidthStatsResponseModel {
    bandwidthLastTwoDays: {
        current: string;
        previous: string;
        difference: string;
    };
    bandwidthLastSevenDays: {
        current: string;
        previous: string;
        difference: string;
    };

    constructor(data: GetBandwidthStatsResponseModel) {
        this.bandwidthLastTwoDays = data.bandwidthLastTwoDays;
        this.bandwidthLastSevenDays = data.bandwidthLastSevenDays;
    }
}
