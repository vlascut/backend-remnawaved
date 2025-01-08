import { FormattedHosts } from '../interfaces/formatted-hosts.interface';
import { XrayTrojanLink } from './interfaces/xray-trojan-link.interface';
import { XrayVlessLink } from './interfaces/xray-vless-link.interface';

type NetworkType = 'grpc' | 'http' | 'kcp' | 'quic' | 'tcp' | 'ws';
// type TLSType = 'tls' | 'reality';

const NETWORK_CONFIGS: Record<
    NetworkType,
    (params: XrayTrojanLink) => Partial<Record<string, unknown>>
> = {
    http: (params) => ({ path: params.path, host: params.host }),
    ws: (params) => ({ path: params.path, host: params.host }),
    tcp: (params) => ({ path: params.path, host: params.host }),
    kcp: (params) => ({ seed: params.path, host: params.host }),
    quic: (params) => ({ key: params.path, quicSecurity: params.host }),
    grpc: (params) => ({
        serviceName: params.path,
        authority: params.host,
        multiMode: 'multi',
    }),
};

export class XrayLinksGenerator {
    private links: string[];

    private hosts: FormattedHosts[];

    private isBase64: boolean;

    constructor(
        hosts: FormattedHosts[],

        isBase64: boolean,
    ) {
        this.hosts = hosts;
        this.isBase64 = isBase64;
        this.links = [];
    }

    addLink(link: string): void {
        this.links.push(link);
    }

    public static generateConfig(host: FormattedHosts[], isBase64: boolean): string {
        const generator = new XrayLinksGenerator(host, isBase64);
        return generator.generate();
    }

    add(host: FormattedHosts): void {
        let link: string | undefined;

        switch (host.protocol) {
            case 'trojan':
                link = XrayLinksGenerator.trojan({
                    remark: host.remark,
                    address: host.address,
                    port: host.port,
                    protocol: host.protocol,
                    path: host.path,
                    host: host.host,
                    tls: host.tls,
                    sni: host.sni,
                    fp: host.fp,
                    alpn: host.alpn,
                    pbk: host.pbk,
                    sid: host.sid,
                    spx: host.spx,
                    ais: host.ais,
                    password: host.password,
                    network: host.network,
                });
                break;
            case 'vless':
                link = XrayLinksGenerator.vless({
                    remark: host.remark,
                    address: host.address,
                    port: host.port,
                    protocol: host.protocol,
                    id: host.password.vlessPassword,
                    net: host.network,
                    path: host.path,
                    host: host.host.toString(),
                    type: '',
                    flow: 'xtls-rprx-vision',
                    tls: host.tls,
                    sni: host.sni,
                    fp: host.fp,
                    alpn: host.alpn,
                    pbk: host.pbk,
                    sid: host.sid,
                    spx: host.spx,
                    ais: false,
                    fs: '',
                    multiMode: false,
                });
                break;
        }

        if (link) {
            this.addLink(link);
        }
    }

    private static trojan(params: XrayTrojanLink): string {
        const payload: Record<string, unknown> = {
            security: params.tls,
            type: params.network,
            headerType: '',
        };

        const network = params.network || 'tcp';
        if (network in NETWORK_CONFIGS) {
            Object.assign(payload, NETWORK_CONFIGS[network as NetworkType](params));
        }

        const tlsConfig = XrayLinksGenerator.getTLSConfig(params);
        Object.assign(payload, tlsConfig);

        const stringPayload = XrayLinksGenerator.convertPayloadToString(payload);
        return XrayLinksGenerator.formatTrojanURL(params, stringPayload);
    }

    private static vless(params: XrayVlessLink): string {
        const payload: Record<string, unknown> = {
            security: params.tls || 'none',
            type: params.net || 'ws',
            headerType: params.type || '',
        };

        if (
            params.flow &&
            params.tls &&
            ['reality', 'tls'].includes(params.tls) &&
            params.net &&
            ['kcp', 'raw', 'tcp'].includes(params.net) &&
            params.type !== 'http'
        ) {
            payload.flow = params.flow;
        }

        const network = params.net || 'tcp';
        if (network === 'grpc') {
            Object.assign(payload, {
                serviceName: params.path,
                authority: params.host,
                mode: params.multiMode ? 'multi' : 'gun',
            });
        } else if (network === 'quic') {
            Object.assign(payload, {
                key: params.path,
                quicSecurity: params.host,
            });
        } else if (['splithttp', 'xhttp'].includes(network)) {
            const extra: Record<string, unknown> = {
                scMaxEachPostBytes: params.scMaxEachPostBytes || 1000000,
                scMaxConcurrentPosts: params.scMaxConcurrentPosts || 100,
                scMinPostsIntervalMs: params.scMinPostsIntervalMs || 30,
                xPaddingBytes: params.xPaddingBytes || '100-1000',
                noGRPCHeader: params.noGRPCHeader || false,
            };

            if (params.keepAlivePeriod) {
                extra.keepAlivePeriod = params.keepAlivePeriod;
            }
            if (params.xmux && Object.keys(params.xmux).length > 0) {
                extra.xmux = params.xmux;
            }

            Object.assign(payload, {
                path: params.path,
                host: params.host,
                mode: params.mode || 'auto',
                extra: JSON.stringify(extra),
            });
        } else if (network === 'ws') {
            Object.assign(payload, {
                path: params.path,
                host: params.host,
                ...(params.heartbeatPeriod && { heartbeatPeriod: params.heartbeatPeriod }),
            });
        } else {
            Object.assign(payload, {
                path: params.path,
                host: params.host,
            });
        }

        if (params.tls === 'tls') {
            Object.assign(payload, {
                sni: params.sni,
                fp: params.fp,
                ...(params.alpn && { alpn: params.alpn }),
                ...(params.fs && { fragment: params.fs }),
                ...(params.ais && { allowInsecure: 1 }),
            });
        } else if (params.tls === 'reality') {
            Object.assign(payload, {
                sni: params.sni,
                fp: params.fp,
                pbk: params.pbk,
                sid: params.sid,
                ...(params.spx && { spx: params.spx }),
            });
        }

        const stringPayload = XrayLinksGenerator.convertPayloadToString(payload);
        return `vless://${params.id}@${params.address}:${params.port}?${new URLSearchParams(stringPayload).toString()}#${encodeURIComponent(params.remark)}`;
    }

    private static getTLSConfig(params: XrayTrojanLink): Record<string, unknown> {
        const config: Record<string, unknown> = {};

        if (params.tls === 'tls') {
            Object.assign(config, {
                sni: params.sni,
                fp: params.fp,
                ...(params.alpn && { alpn: params.alpn }),
                ...(params.ais && { allowInsecure: 1 }),
            });
        } else if (params.tls === 'reality') {
            Object.assign(config, {
                sni: params.sni,
                fp: params.fp,
                pbk: params.pbk,
                sid: params.sid,
                ...(params.spx && { spx: params.spx }),
            });
        }

        return config;
    }

    private static convertPayloadToString(
        payload: Record<string, unknown>,
    ): Record<string, string> {
        return Object.fromEntries(
            Object.entries(payload)
                /* eslint-disable @typescript-eslint/no-unused-vars */
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)]),
        );
    }

    private static formatTrojanURL(
        params: XrayTrojanLink,
        stringPayload: Record<string, string>,
    ): string {
        return `trojan://${encodeURIComponent(params.password.trojanPassword)}@${params.address}:${params.port}?${new URLSearchParams(stringPayload).toString()}#${encodeURIComponent(params.remark)}`;
    }

    private generate(): string {
        for (const host of this.hosts) {
            if (!host) {
                continue;
            }
            this.add(host);
        }

        const linksString = this.links.join('\n');
        if (this.isBase64) {
            return Buffer.from(linksString).toString('base64');
        }
        return linksString;
    }
}
