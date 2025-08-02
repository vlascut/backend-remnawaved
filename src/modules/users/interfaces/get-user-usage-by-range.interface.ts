export interface IGetUserUsageByRange {
    userUuid: string;
    nodeUuid: string;
    nodeName: string;
    countryCode: string;
    total: bigint;
    date: string;
}
