interface NodeDayStatsInput {
    nodeName: string;
    date: string;
    totalBytes: bigint | string;
}

interface NodeDayStats {
    nodeName: string;
    date: string;
    totalBytes: string;
}

export class GetNodesStatisticsResponseModel {
    lastSevenDays: NodeDayStats[];

    constructor(data: { lastSevenDays: NodeDayStatsInput[] }) {
        this.lastSevenDays = data.lastSevenDays.map((day) => ({
            ...day,
            totalBytes: day.totalBytes.toString(),
        }));
    }
}
