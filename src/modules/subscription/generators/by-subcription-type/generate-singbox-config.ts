import semver from 'semver';

import { FormattedHosts } from '../interfaces/formatted-hosts.interface';
import { ConfigTemplatesService } from '@modules/subscription/config-templates.service';

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
    headers?: Record<string, unknown>;
    path?: string;
    max_early_data?: number;
    early_data_header_name?: string;
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
    private config: Record<string, any>;
    private settings: Record<string, any>;
    private version: null | string;
    constructor(
        hosts: FormattedHosts[],
        version: null | string,
        private readonly configTemplatesService: ConfigTemplatesService,
    ) {
        this.hosts = hosts;
        this.version = version;

        this.proxy_remarks = [];

        if (this.version && semver.gte(this.version, '1.11.0')) {
            const templateContent = this.configTemplatesService.getTemplate('SINGBOX_TEMPLATE');
            this.config = JSON.parse(templateContent);
        } else {
            const templateContent =
                this.configTemplatesService.getTemplate('SINGBOX_LEGACY_TEMPLATE');
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

    public static generateConfig(
        hosts: FormattedHosts[],
        version: null | string,
        configTemplatesService: ConfigTemplatesService,
    ): string {
        try {
            return new SingBoxConfiguration(hosts, version, configTemplatesService).generate();
        } catch {
            return '';
        }
    }

    public add_outbound(outbound_data: OutboundConfig): void {
        this.config.outbounds.push(outbound_data);
    }

    public render(): string {
        const urltest_types = ['vless', 'trojan', 'shadowsocks'];
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
    ): TlsConfig {
        const config: TlsConfig = {};

        if (tls === 'tls' || tls === 'reality') {
            config.enabled = true;
        }

        if (sni) {
            config.server_name = sni;
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
                fingerprint: fp || 'chrome',
            };
        }

        if (alpn) {
            config.alpn = Array.isArray(alpn) ? alpn : [alpn];
        }

        return config;
    }

    public ws_config(
        host: string = '',
        path: string = '',
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

        if (max_early_data !== undefined) {
            config.max_early_data = max_early_data;
        }
        if (early_data_header_name) {
            config.early_data_header_name = early_data_header_name;
        }

        return config;
    }

    public transport_config(
        transport_type: string = '',
        host: string = '',
        path: string = '',
        max_early_data?: number,
        early_data_header_name?: string,
    ): TransportConfig {
        let transport_config: TransportConfig = { type: transport_type };

        if (transport_type) {
            switch (transport_type) {
                case 'ws':
                    transport_config = this.ws_config(
                        host,
                        path,
                        max_early_data,
                        early_data_header_name,
                    );
                    break;
            }
        }

        transport_config.type = transport_type;
        return transport_config;
    }

    public make_outbound(params: FormattedHosts): OutboundConfig {
        const config: OutboundConfig = {
            type: params.protocol,
            tag: params.remark,
            server: params.address,
            server_port: params.port,
        };

        if (
            ['tcp', 'raw'].includes(params.network) &&
            params.headerType !== 'http' &&
            ['tls', 'reality'].includes(params.tls) &&
            params.protocol === 'vless'
        ) {
            config.flow = 'xtls-rprx-vision';
        }

        if (params.protocol === 'shadowsocks') {
            config.network = 'tcp';
        }

        if (['ws'].includes(params.network)) {
            let max_early_data: number | undefined;
            let early_data_header_name: string | undefined;

            if (params.path.includes('?ed=')) {
                const [pathPart, edPart] = params.path.split('?ed=');
                params.path = pathPart;
                [max_early_data] = edPart.split('/').map(Number);
                early_data_header_name = 'Sec-WebSocket-Protocol';
            }

            config.transport = this.transport_config(
                params.network,
                params.host[0],
                params.path,
                max_early_data,
                early_data_header_name,
            );
        }

        if (['tls', 'reality'].includes(params.tls)) {
            config.tls = this.tls_config(
                params.sni,
                params.fingerprint,
                params.tls,
                params.publicKey,
                params.shortId,
                params.alpn,
            );
        }
        return config;
    }

    public add(host: FormattedHosts): void {
        try {
            if (host.network === 'xhttp') {
                return;
            }

            const remark = host.remark;
            this.proxy_remarks.push(remark);

            const outbound = this.make_outbound(host);

            switch (host.protocol) {
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
        } catch (error) {
            console.log(error);
        }
    }
}
