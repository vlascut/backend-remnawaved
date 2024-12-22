import { StreamSettingsObject } from '@common/helpers/xray-config/interfaces/transport.config';

export interface XrayTrojanLink {
    address: string;
    ais: boolean;
    alpn: string;
    fp: string;
    host: string | string[];
    network: StreamSettingsObject['network'];
    password: {
        trojanPassword: string;
        vlessPassword: string;
    };
    path: string;
    pbk: string;
    port: number;
    protocol: string;
    remark: string;
    sid: string;
    sni: string;
    spx: string;
    tls: string;
}
