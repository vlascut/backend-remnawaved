import { FormattedHosts } from '../interfaces/formatted-hosts.interface';
import { XrayTrojanLink } from './interfaces/xray-trojan-link.interface';

type NetworkType = 'http' | 'ws' | 'tcp' | 'kcp' | 'quic' | 'grpc';
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
