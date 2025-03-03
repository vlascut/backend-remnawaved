import { StreamSettingsObject } from '@common/helpers/xray-config/interfaces/transport.config';

import { XrayShadowsocksLink } from './interfaces/xray-shadowsocks-link.interface';
import { FormattedHosts } from '../interfaces/formatted-hosts.interface';

const NETWORK_CONFIGS: Record<
    StreamSettingsObject['network'],
    (params: FormattedHosts) => Partial<Record<string, unknown>>
> = {
    ws: (params) => ({ path: params.path, host: params.host }),
    tcp: (params) => ({ path: params.path, host: params.host }),
    raw: (params) => ({ path: params.path, host: params.host }),
    xhttp: (params) => ({ path: params.path, host: params.host }),
};

export class XrayLinksGenerator {
    private links: string[] = [];

    private hosts: FormattedHosts[] = [];

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
        return generator.generate() as string;
    }

    public static generateLinks(host: FormattedHosts[]): string[] {
        const generator = new XrayLinksGenerator(host, false);
        return generator.generate() as string[];
    }

    add(host: FormattedHosts): void {
        let link: string | undefined;

        switch (host.protocol) {
            case 'trojan':
                link = XrayLinksGenerator.trojan(host);
                break;
            case 'vless':
                link = XrayLinksGenerator.vless(host);
                break;
            case 'shadowsocks':
                link = XrayLinksGenerator.shadowsocks({
                    remark: host.remark,
                    address: host.address,
                    port: host.port,
                    method: 'chacha20-ietf-poly1305',
                    password: host.password.ssPassword,
                });
                break;
        }

        if (link) {
            this.addLink(link);
        }
    }

    private static trojan(params: FormattedHosts): string {
        const payload: Record<string, unknown> = {
            security: params.tls,
            type: params.network,
            headerType: params.headerType || '',
        };

        const network = params.network || 'tcp';
        if (network in NETWORK_CONFIGS) {
            Object.assign(
                payload,
                NETWORK_CONFIGS[network as StreamSettingsObject['network']](params),
            );
        }

        if (
            ['reality', 'tls'].includes(params.tls) &&
            ['raw', 'tcp'].includes(params.network) &&
            params.headerType !== 'http'
        ) {
            Object.assign(payload, {
                flow: 'xtls-rprx-vision',
            });
        }

        if (params.network === 'xhttp') {
            const extra: FormattedHosts['additionalParams'] = {
                scMaxEachPostBytes: params.additionalParams?.scMaxEachPostBytes,
                scMaxConcurrentPosts: params.additionalParams?.scMaxConcurrentPosts,
                scMinPostsIntervalMs: params.additionalParams?.scMinPostsIntervalMs,
                xPaddingBytes: params.additionalParams?.xPaddingBytes,
                noGRPCHeader: params.additionalParams?.noGRPCHeader,
            };

            Object.assign(payload, {
                path: params.path,
                host: params.host,
                mode: params.additionalParams?.mode || 'auto',
                extra: JSON.stringify(extra),
            });
        }

        if (params.network === 'ws') {
            if (params.additionalParams?.heartbeatPeriod) {
                Object.assign(payload, {
                    heartbeatPeriod: params.additionalParams?.heartbeatPeriod,
                });
            }
        }

        const tlsParams: Record<string, unknown> = {};

        if (params.tls === 'tls') {
            Object.assign(tlsParams, {
                sni: params.sni,
                fp: params.fingerprint,
                ...(params.alpn && { alpn: params.alpn }),
            });
        } else if (params.tls === 'reality') {
            Object.assign(tlsParams, {
                sni: params.sni,
                fp: params.fingerprint,
                pbk: params.publicKey,
                sid: params.shortId,
                ...(params.spiderX && { spx: params.spiderX }),
            });
        }

        Object.assign(payload, tlsParams);

        const stringPayload = XrayLinksGenerator.convertPayloadToString(payload);
        return `trojan://${encodeURIComponent(params.password.trojanPassword)}@${params.address}:${params.port}?${new URLSearchParams(stringPayload).toString()}#${encodeURIComponent(params.remark)}`;
    }

    private static vless(params: FormattedHosts): string {
        const payload: Record<string, unknown> = {
            security: params.tls,
            type: params.network,
            headerType: params.headerType || '',
        };

        const network = params.network || 'tcp';
        if (network in NETWORK_CONFIGS) {
            Object.assign(
                payload,
                NETWORK_CONFIGS[network as StreamSettingsObject['network']](params),
            );
        }

        if (
            ['reality', 'tls'].includes(params.tls) &&
            ['raw', 'tcp'].includes(params.network) &&
            params.headerType !== 'http'
        ) {
            Object.assign(payload, {
                flow: 'xtls-rprx-vision',
            });
        }

        if (params.network === 'xhttp') {
            const extra: FormattedHosts['additionalParams'] = {
                scMaxEachPostBytes: params.additionalParams?.scMaxEachPostBytes,
                scMaxConcurrentPosts: params.additionalParams?.scMaxConcurrentPosts,
                scMinPostsIntervalMs: params.additionalParams?.scMinPostsIntervalMs,
                xPaddingBytes: params.additionalParams?.xPaddingBytes,
                noGRPCHeader: params.additionalParams?.noGRPCHeader,
            };

            Object.assign(payload, {
                path: params.path,
                host: params.host,
                mode: params.additionalParams?.mode || 'auto',
                extra: JSON.stringify(extra),
            });
        }

        if (params.network === 'ws') {
            if (params.additionalParams?.heartbeatPeriod) {
                Object.assign(payload, {
                    heartbeatPeriod: params.additionalParams?.heartbeatPeriod,
                });
            }
        }

        const tlsParams: Record<string, unknown> = {};

        if (params.tls === 'tls') {
            Object.assign(tlsParams, {
                sni: params.sni,
                fp: params.fingerprint,
                ...(params.alpn && { alpn: params.alpn }),
            });
        } else if (params.tls === 'reality') {
            Object.assign(tlsParams, {
                sni: params.sni,
                fp: params.fingerprint,
                pbk: params.publicKey,
                sid: params.shortId,
                ...(params.spiderX && { spx: params.spiderX }),
            });
        }

        Object.assign(payload, tlsParams);

        const stringPayload = XrayLinksGenerator.convertPayloadToString(payload);
        return `vless://${params.password.vlessPassword}@${params.address}:${params.port}?${new URLSearchParams(stringPayload).toString()}#${encodeURIComponent(params.remark)}`;
    }

    private static shadowsocks(params: XrayShadowsocksLink): string {
        const base64Credentials = Buffer.from(`${params.method}:${params.password}`).toString(
            'base64',
        );

        const encodedRemark = encodeURIComponent(params.remark);

        return `ss://${base64Credentials}@${params.address}:${params.port}#${encodedRemark}`;
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

    private generate(): string | string[] {
        for (const host of this.hosts) {
            if (!host) {
                continue;
            }
            this.add(host);
        }

        const linksString = this.links.join('\n');
        if (this.isBase64) {
            return Buffer.from(linksString).toString('base64');
        } else {
            return this.links;
        }
    }
}
