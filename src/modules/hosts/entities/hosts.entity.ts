export class HostsEntity {
    uuid: string;
    inboundUuid: string;
    viewPosition: number;
    remark: string;
    address: string;
    port: number;
    path: null | string;
    sni: null | string;
    host: null | string;
    alpn: null | string;
    fingerprint: null | string;
    allowInsecure: boolean;
    isDisabled: boolean;

    constructor(data: Partial<HostsEntity>) {
        Object.assign(this, data);
    }
}
