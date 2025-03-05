export interface NodeHealthCheckPayload {
    nodeUuid: string;
    nodeAddress: string;
    nodePort: number | null;
}
