import { readFileSync } from 'node:fs';
import path from 'node:path';
import semver from 'semver';

import { isDevelopment } from '@common/utils/startup-app';

import { FormattedHosts } from '../interfaces/formatted-hosts.interface';

const SINGBOX_LEGACY_TEMPLATE_PATH = isDevelopment()
    ? path.join(__dirname, '../../../../../../configs/singbox/singbox_legacy.json')
    : path.join('/var/lib/remnawave/configs/singbox/singbox_legacy.json');

const SINGBOX_TEMPLATE_PATH = isDevelopment()
    ? path.join(__dirname, '../../../../../../configs/singbox/singbox_template.json')
    : path.join('/var/lib/remnawave/configs/singbox/singbox_template.json');

interface OutboundConfig {
    flow?: string;
    method?: string;
    multiplex?: any;
    network?: string;
    outbounds?: string[];
    password?: string;
    server: string;
    server_port: number;
    tag: string;
    tls?: any;
    transport?: any;
    type: string;
    uuid?: string;
}

interface TlsConfig {
    alpn?: string[];
    enabled?: boolean;
    insecure?: boolean;
    reality?: {
        enabled: boolean;
        public_key?: string;
        short_id?: string;
    };
    server_name?: string;
    utls?: {
        enabled: boolean;
        fingerprint: string;
    };
}

interface TransportConfig {
    early_data_header_name?: string;
    headers?: Record<string, any>;
    host?: string | string[];
    max_early_data?: number;
    path?: string;
    service_name?: string;
    type: string;
}

// interface InboundConfig {
//     protocol: string;
//     network: string;
//     path: string;
//     port: number | string;
//     tls: string;
//     sni: string;
//     host: string;
//     header_type: string;
//     alpn?: string;
//     fp?: string;
//     pbk?: string;
//     sid?: string;
//     ais?: string;
//     mux_enable?: boolean;
//     random_user_agent?: boolean;
// }

export class SingBoxConfiguration {
    private hosts: FormattedHosts[];
    private proxy_remarks: string[] = [];
    private config: any;
    private mux_template: string;
    private user_agent_list: string[];
    private settings: any;
    private version: null | string;
    constructor(hosts: FormattedHosts[], version: null | string) {
        this.hosts = hosts;
        this.version = version;

        this.proxy_remarks = [];

        if (this.version && semver.gte(this.version, '1.11.0')) {
            const templateContent = readFileSync(SINGBOX_TEMPLATE_PATH, 'utf-8');
            this.config = JSON.parse(templateContent);
        } else {
            const templateContent = readFileSync(SINGBOX_LEGACY_TEMPLATE_PATH, 'utf-8');
            this.config = JSON.parse(templateContent);
        }
        if (this.version && semver.satisfies(this.version, '>=1.10.0')) {
            // version 1.10.x
            // Reference: https://sing-box.sagernet.org/migration/#tun-address-fields-are-merged
            const tunInboundIndex = this.config.inbounds.findIndex(
                (inbound: any) => inbound.type === 'tun',
            );

            if (tunInboundIndex !== -1) {
                const tunInbound = this.config.inbounds[tunInboundIndex];

                if (tunInbound.inet4_address || tunInbound.inet6_address) {
                    tunInbound.address = [
                        tunInbound.inet4_address,
                        tunInbound.inet6_address,
                    ].filter(Boolean);
                    delete tunInbound.inet4_address;
                    delete tunInbound.inet6_address;
                }

                if (tunInbound.inet4_route_address || tunInbound.inet6_route_address) {
                    tunInbound.route_address = [
                        ...(tunInbound.inet4_route_address || []),
                        ...(tunInbound.inet6_route_address || []),
                    ];
                    delete tunInbound.inet4_route_address;
                    delete tunInbound.inet6_route_address;
                }

                if (
                    tunInbound.inet4_route_exclude_address ||
                    tunInbound.inet6_route_exclude_address
                ) {
                    tunInbound.route_exclude_address = [
                        ...(tunInbound.inet4_route_exclude_address || []),
                        ...(tunInbound.inet6_route_exclude_address || []),
                    ];
                    delete tunInbound.inet4_route_exclude_address;
                    delete tunInbound.inet6_route_exclude_address;
                }

                this.config.inbounds[tunInboundIndex] = tunInbound;
            }
        }
        // this.mux_template = JSON.stringify({ 'sing-box': { enabled: true } });
        // const user_agent_data = { list: [] };

        // this.user_agent_list = user_agent_data?.list || [];

        // try {
        //     this.settings = {};
        // } catch {
        //     this.settings = {};
        // }
    }

    private generate(): string {
        for (const host of this.hosts) {
            if (!host) {
                continue;
            }

            this.add(host);
        }

        return this.render();
    }

    public static generateConfig(hosts: FormattedHosts[], version: null | string): string {
        try {
            return new SingBoxConfiguration(hosts, version).generate();
        } catch {
            return '';
        }
    }

    public add_outbound(outbound_data: OutboundConfig): void {
        this.config.outbounds.push(outbound_data);
    }

    public render(): string {
        const urltest_types = ['vmess', 'vless', 'trojan', 'shadowsocks'];
        const urltest_tags = this.config.outbounds
            .filter((outbound: OutboundConfig) => urltest_types.includes(outbound.type))
            .map((outbound: OutboundConfig) => outbound.tag);

        const selector_types = [...urltest_types, 'urltest'];
        const selector_tags = this.config.outbounds
            .filter((outbound: OutboundConfig) => selector_types.includes(outbound.type))
            .map((outbound: OutboundConfig) => outbound.tag);

        this.config.outbounds.forEach((outbound: OutboundConfig) => {
            if (outbound.type === 'urltest') {
                outbound.outbounds = urltest_tags;
            }
            if (outbound.type === 'selector') {
                outbound.outbounds = selector_tags;
            }
        });

        return JSON.stringify(this.config, null, 4);
    }

    public tls_config(
        sni?: string,
        fp?: string,
        tls?: string,
        pbk?: string,
        sid?: string,
        alpn?: string | string[],
        ais?: string,
    ): TlsConfig {
        const config: TlsConfig = {};

        if (tls === 'tls' || tls === 'reality') {
            config.enabled = true;
        }

        if (sni) {
            config.server_name = sni;
        }

        if (tls === 'tls' && ais) {
            config.insecure = Boolean(ais);
        }

        if (tls === 'reality') {
            config.reality = { enabled: true };
            if (pbk) {
                config.reality.public_key = pbk;
            }
            if (sid) {
                config.reality.short_id = sid;
            }
        }

        if (fp) {
            config.utls = {
                enabled: Boolean(fp),
                fingerprint: fp,
            };
        }

        if (!fp && tls === 'reality') {
            config.utls = {
                enabled: true,
                fingerprint: 'chrome',
            };
        }

        if (alpn) {
            config.alpn = Array.isArray(alpn) ? alpn : [alpn];
        }

        return config;
    }

    public http_config(
        host: string = '',
        path: string = '',
        random_user_agent: boolean = false,
    ): TransportConfig {
        const config = structuredClone(
            this.settings?.httpSettings || {
                idle_timeout: '15s',
                ping_timeout: '15s',
                method: 'GET',
                headers: {},
            },
        );

        if (!config.headers) {
            config.headers = {};
        }

        config.host = [];
        if (path) {
            config.path = path;
        }
        if (host) {
            config.host = [host];
        }
        if (random_user_agent && this.user_agent_list.length > 0) {
            config.headers['User-Agent'] =
                this.user_agent_list[Math.floor(Math.random() * this.user_agent_list.length)];
        }

        return config;
    }

    public ws_config(
        host: string = '',
        path: string = '',
        random_user_agent: boolean = false,
        max_early_data?: number,
        early_data_header_name?: string,
    ): TransportConfig {
        const config = structuredClone(this.settings?.wsSettings || { headers: {} });

        if (!config.headers) {
            config.headers = {};
        }

        if (path) {
            config.path = path;
        }
        if (host) {
            config.headers.Host = host;
        }
        if (random_user_agent && this.user_agent_list.length > 0) {
            config.headers['User-Agent'] =
                this.user_agent_list[Math.floor(Math.random() * this.user_agent_list.length)];
        }
        if (max_early_data !== undefined) {
            config.max_early_data = max_early_data;
        }
        if (early_data_header_name) {
            config.early_data_header_name = early_data_header_name;
        }

        return config;
    }

    public grpc_config(path: string = ''): TransportConfig {
        const config = structuredClone(this.settings?.grpcSettings || {});

        if (path) {
            config.service_name = path;
        }

        return config;
    }

    public httpupgrade_config(
        host: string = '',
        path: string = '',
        random_user_agent: boolean = false,
    ): TransportConfig {
        const config = structuredClone(this.settings?.httpupgradeSettings || { headers: {} });

        if (!config.headers) {
            config.headers = {};
        }

        config.host = host;
        if (path) {
            config.path = path;
        }
        if (random_user_agent && this.user_agent_list.length > 0) {
            config.headers['User-Agent'] =
                this.user_agent_list[Math.floor(Math.random() * this.user_agent_list.length)];
        }

        return config;
    }

    public transport_config(
        transport_type: string = '',
        host: string = '',
        path: string = '',
        max_early_data?: number,
        early_data_header_name?: string,
        random_user_agent: boolean = false,
    ): TransportConfig {
        let transport_config: TransportConfig = { type: transport_type };

        if (transport_type) {
            switch (transport_type) {
                case 'http':
                    transport_config = this.http_config(host, path, random_user_agent);
                    break;
                case 'ws':
                    transport_config = this.ws_config(
                        host,
                        path,
                        random_user_agent,
                        max_early_data,
                        early_data_header_name,
                    );
                    break;
                case 'grpc':
                    transport_config = this.grpc_config(path);
                    break;
                case 'httpupgrade':
                    transport_config = this.httpupgrade_config(host, path, random_user_agent);
                    break;
            }
        }

        transport_config.type = transport_type;
        return transport_config;
    }

    public make_outbound(
        type: string,
        remark: string,
        address: string,
        port: number | string,
        net: string = '',
        path: string = '',
        host: string = '',
        flow: string = '',
        tls: string = '',
        sni: string = '',
        fp: string = '',
        alpn: string | string[] = '',
        pbk: string = '',
        sid: string = '',
        headers: string = '',
        ais: string = '',
        // mux_enable: boolean = false,
        random_user_agent: boolean = false,
    ): OutboundConfig {
        if (typeof port === 'string') {
            const ports = port.split(',');
            port = parseInt(ports[Math.floor(Math.random() * ports.length)]);
        }

        const config: OutboundConfig = {
            type,
            tag: remark,
            server: address,
            server_port: port,
        };

        if (type === 'shadowsocks') {
            config.network = 'tcp';
        }

        if (
            (net === 'tcp' || net === 'raw' || net === 'kcp') &&
            headers !== 'http' &&
            (tls || tls !== 'none')
        ) {
            if (flow) {
                config.flow = flow;
            }
        }

        if (net === 'h2') {
            net = 'http';
            alpn = 'h2';
        } else if (net === 'h3') {
            net = 'http';
            alpn = 'h3';
        } else if ((net === 'tcp' || net === 'raw') && headers === 'http') {
            net = 'http';
        }

        if (['grpc', 'http', 'httpupgrade', 'quic', 'ws'].includes(net)) {
            let max_early_data: number | undefined;
            let early_data_header_name: string | undefined;

            if (path.includes('?ed=')) {
                const [pathPart, edPart] = path.split('?ed=');
                path = pathPart;
                [max_early_data] = edPart.split('/').map(Number);
                early_data_header_name = 'Sec-WebSocket-Protocol';
            }

            config.transport = this.transport_config(
                net,
                host,
                path,
                max_early_data,
                early_data_header_name,
                random_user_agent,
            );
        }

        if (tls === 'tls' || tls === 'reality') {
            config.tls = this.tls_config(sni, fp, tls, pbk, sid, alpn, ais);
        }

        return config;
    }

    public add(host: FormattedHosts): void {
        const net = host.network || 'tcp';
        const path = host.path;

        if (net === 'kcp' || net === 'quic') {
            return;
        }

        // if (net === 'grpc' || net === 'gun') {
        //     path = this.getGrpcGun(path);
        // }

        const alpn = host.alpn;

        const remark = host.remark;
        this.proxy_remarks.push(remark);

        const outbound = this.make_outbound(
            host.protocol,
            remark,
            host.address,
            host.port,
            net,
            path,
            host.host[0],
            '',
            host.tls,
            host.sni,
            host.fp || '',
            alpn ? alpn.split(',') : undefined,
            host.pbk || '',
            host.sid || '',
            '',
            '',
            false,
            // false,
        );

        switch (host.protocol) {
            case 'vmess':
            case 'vless':
                outbound.uuid = host.password.vlessPassword;
                break;
            case 'trojan':
                outbound.password = host.password.trojanPassword;
                break;
            case 'shadowsocks':
                outbound.password = host.password.ssPassword;
                outbound.method = 'chacha20-ietf-poly1305';

                break;
        }

        this.add_outbound(outbound);
    }
}
