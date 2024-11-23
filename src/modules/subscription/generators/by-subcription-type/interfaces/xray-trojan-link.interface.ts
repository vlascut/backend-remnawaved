import { StreamSettingsObject } from '../../../../../common/helpers/xray-config/interfaces/transport.config';

export interface XrayTrojanLink {
    remark: string;
    address: string;
    port: number;
    protocol: string;
    path: string;
    host: string | string[];
    tls: string;
    sni: string;
    fp: string;
    alpn: string;
    pbk: string;
    sid: string;
    spx: string;
    ais: boolean;
    password: {
        trojanPassword: string;
        vlessPassword: string;
    };
    network: StreamSettingsObject['network'];
}
