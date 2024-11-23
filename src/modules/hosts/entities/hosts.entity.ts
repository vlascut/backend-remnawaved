export class HostsEntity {
    uuid: string;
    inboundUuid: string;
    viewPosition: number;
    remark: string;
    address: string;
    port: number;
    path: string | null;
    sni: string | null;
    host: string | null;
    alpn: string | null;
    fingerprint: string | null;
    allowInsecure: boolean;
    isDisabled: boolean;

    constructor(data: Partial<HostsEntity>) {
        Object.assign(this, data);
    }
}
