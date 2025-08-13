export interface IGetNodesUsageByRange {
    nodeName: string;
    nodeUuid: string;
    nodeCountryCode: string;
    total: bigint;
    totalDownload: bigint;
    totalUpload: bigint;
    date: string;
}
