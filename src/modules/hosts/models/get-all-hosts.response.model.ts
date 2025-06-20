import { TSecurityLayers } from '@libs/contracts/constants';

import { HostsEntity } from '../entities/hosts.entity';

export class GetAllHostsResponseModel {
    public uuid: string;
    public viewPosition: number;
    public remark: string;
    public address: string;
    public port: number;
    public path: null | string;
    public sni: null | string;
    public host: null | string;
    public alpn: null | string;
    public fingerprint: null | string;
    public isDisabled: boolean;
    public securityLayer: TSecurityLayers;
    public xHttpExtraParams: null | object;

    public configProfileUuid: string | null;
    public configProfileInboundUuid: string | null;

    constructor(data: HostsEntity) {
        this.uuid = data.uuid;

        this.viewPosition = data.viewPosition;
        this.remark = data.remark;
        this.address = data.address;
        this.port = data.port;
        this.path = data.path;
        this.sni = data.sni;
        this.host = data.host;
        this.alpn = data.alpn;
        this.fingerprint = data.fingerprint;

        this.isDisabled = data.isDisabled;
        this.securityLayer = data.securityLayer;
        this.xHttpExtraParams = data.xHttpExtraParams;

        this.configProfileUuid = data.configProfileUuid;
        this.configProfileInboundUuid = data.configProfileInboundUuid;
    }
}
