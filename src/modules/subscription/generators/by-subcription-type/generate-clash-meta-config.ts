import { FormattedHosts } from '../interfaces/formatted-hosts.interface';
import { ClashConfiguration, ProxyNode } from './generate-clash-config';

export class ClashMetaConfiguration extends ClashConfiguration {
    protected makeNode(params: {
        name: string;
        remark: string;
        type: string;
        server: string;
        port: number;
        network: string;
        tls: boolean;
        sni: string;
        host: string;
        path: string;
        headers?: string;
        udp?: boolean;
        alpn?: string;
        fp?: string;
        pbk?: string;
        sid?: string;
        ais?: boolean;
        muxEnable?: boolean;
        randomUserAgent?: boolean;
    }): ProxyNode {
        const node = super.makeNode(params);

        if (params.fp) {
            node['client-fingerprint'] = params.fp;
        }
        if (params.pbk) {
            node['reality-opts'] = {
                'public-key': params.pbk,
                'short-id': params.sid,
            };
        }

        return node;
    }
    public add(host: FormattedHosts): void {
        if (
            !host.network ||
            ['kcp', 'splithttp'].includes(host.network) ||
            host.network === 'quic'
        ) {
            return;
        }

        const proxyRemark = host.remark;

        const node = this.makeNode({
            name: host.remark,
            remark: proxyRemark,
            type: host.protocol,
            server: host.address,
            port: host.port,
            network: host.network,
            tls: ['tls', 'reality'].includes(host.tls),
            sni: host.sni,
            host: host.host[0],
            path: host.path,
            headers: '',
            udp: true,
            alpn: host.alpn,
            fp: host.fp,
            pbk: host.pbk,
            sid: host.sid,
            ais: host.ais,
            muxEnable: false,
            randomUserAgent: false,
        });

        switch (host.protocol) {
            case 'vless':
                node.uuid = host.password.vlessPassword;
                node.flow = '';
                // !TODO add flow

                // if (
                //     ['tcp', 'raw', 'kcp'].includes(host.network) &&
                //     host.headerType !== 'http' &&
                //     inbound.tls !== 'none'
                // ) {
                //     node.flow = settings.flow || '';
                // }
                break;
            case 'trojan':
                node.password = host.password.trojanPassword;
                break;
            case 'shadowsocks':
                // node.password = host.password.shadowsocksPassword;
                // node.cipher = host.password.shadowsocksMethod;
                // TODO add shadowsocks
                break;
            default:
                return;
        }

        this.data.proxies.push(node);
        this.proxyRemarks.push(proxyRemark);
    }
}
