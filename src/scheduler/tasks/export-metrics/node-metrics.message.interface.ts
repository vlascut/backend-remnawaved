interface INodeMetrics {
    nodeUuid: string;
    inbounds: {
        tag: string;
        downlink: string;
        uplink: string;
    }[];
    outbounds: {
        tag: string;
        downlink: string;
        uplink: string;
    }[];
}

export class NodeMetricsMessage {
    constructor(public readonly nodeMetrics: INodeMetrics) {}
}

export class RemoveNodeMetricsMessage {
    constructor() {}
}
