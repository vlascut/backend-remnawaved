import { dump as yamlDump } from 'js-yaml';
import nunjucks from 'nunjucks';

import { ConfigTemplatesService } from '@modules/subscription/config-templates.service';

import { FormattedHosts } from '../interfaces/formatted-hosts.interface';

const env = nunjucks.configure({ autoescape: false });
env.addFilter('yaml', (obj: any) => yamlDump(obj));
env.addFilter('indent', (str: string, width: number) => {
    return str
        .split('\n')
        .map((line) => ' '.repeat(width) + line)
        .join('\n');
});

export interface ClashData {
    proxies: ProxyNode[];
    'proxy-groups': any[];
    rules: string[];
}

interface NetworkConfig {
    'early-data-header-name'?: string;
    'grpc-service-name'?: string;
    headers?: Record<string, string>;
    Host?: string;
    host?: string[];
    'max-early-data'?: number;
    path?: string | string[];
    smux?: {
        [key: string]: any;
        enabled: boolean;
    };
    'v2ray-http-upgrade'?: boolean;
    'v2ray-http-upgrade-fast-open'?: boolean;
}

interface ProxyNode {
    [key: string]: any;
    alpn?: string[];
    alterId?: number;
    cipher?: string;
    name: string;
    network: string;
    password?: string;
    port: number;
    server: string;
    servername?: string;
    'skip-cert-verify'?: boolean;
    sni?: string;
    tls?: boolean;
    type: string;
    udp: boolean;
    uuid?: string;
}

export class ClashMetaConfiguration {
    protected data: ClashData;
    protected proxyRemarks: string[];
    protected settings: any = {};
    protected isStash: boolean;
    private hosts: FormattedHosts[];

    constructor(
        hosts: FormattedHosts[],
        isStash = false,
        private readonly configTemplatesService: ConfigTemplatesService,
    ) {
        this.hosts = hosts;
        this.data = {
            proxies: [],
            'proxy-groups': [],
            rules: [],
        };
        this.proxyRemarks = [];
        this.isStash = isStash;
    }

    public render(): string {
        const context = {
            proxies: this.data.proxies,
            proxy_remarks: this.proxyRemarks,
        };

        return env.renderString(
            this.configTemplatesService.getTemplate(
                this.isStash ? 'STASH_TEMPLATE' : 'CLASH_TEMPLATE',
            ),
            context,
        );
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
        configTemplatesService: ConfigTemplatesService,
        isStash = false,
    ): string {
        try {
            return new ClashMetaConfiguration(hosts, isStash, configTemplatesService).generate();
        } catch {
            return '';
        }
    }

    public toString(): string {
        return this.render();
    }

    protected httpConfig(path = '', host = ''): NetworkConfig {
        const config: NetworkConfig = {
            ...(this.settings['http-opts'] || { headers: {} }),
        };

        if (path) {
            config.path = [path];
        }
        if (host) {
            config.Host = host;
        }

        return config;
    }

    protected wsConfig(
        path = '',
        host = '',
        maxEarlyData?: number,
        earlyDataHeaderName = '',
        isHttpupgrade = false,
        randomUserAgent = false,
    ): NetworkConfig {
        const config: NetworkConfig = {
            ...(this.settings['ws-opts'] || {}),
        };

        if (!config.headers && (host || randomUserAgent)) {
            config.headers = {};
        }

        if (path) {
            config.path = path;
        }
        if (host && config.headers) {
            config.headers.Host = host;
        }

        if (maxEarlyData) {
            config['max-early-data'] = maxEarlyData;
            config['early-data-header-name'] = earlyDataHeaderName;
        }
        if (isHttpupgrade) {
            config['v2ray-http-upgrade'] = true;
            if (maxEarlyData) {
                config['v2ray-http-upgrade-fast-open'] = true;
            }
        }

        return config;
    }

    protected grpcConfig(path = ''): NetworkConfig {
        const config: NetworkConfig = {
            ...(this.settings['grpc-opts'] || {}),
        };

        if (path) {
            config['grpc-service-name'] = path;
        }

        return config;
    }

    protected tcpConfig(path = '', host = ''): NetworkConfig {
        const config: NetworkConfig = {
            ...(this.settings['tcp-opts'] || {}),
        };

        if (path) {
            config.path = [path];
        }
        if (host) {
            if (!config.headers) {
                config.headers = {};
            }
            config.headers.Host = host;
        }

        return config;
    }

    protected makeNode(params: {
        alpn?: string;
        fp?: string;
        headers?: string;
        host: string;
        name: string;
        network: string;
        path: string;
        pbk?: string;
        port: number;
        remark: string;
        server: string;
        sid?: string;
        sni: string;
        tls: boolean;
        type: string;
        udp?: boolean;
    }): ProxyNode {
        const {
            remark,
            server,
            port,
            tls,
            sni,
            host,
            headers = '',
            udp = true,
            alpn = '',
        } = params;

        let { type, network, path } = params;

        if (type === 'shadowsocks') {
            type = 'ss';
        }
        if ((network === 'tcp' || network === 'raw') && headers === 'http') {
            network = 'http';
        }

        let isHttpupgrade = false;
        if (network === 'httpupgrade') {
            network = 'ws';
            isHttpupgrade = true;
        }

        const node: ProxyNode = {
            name: remark,
            type,
            server,
            port,
            network,
            udp,
        };

        let maxEarlyData: number | undefined;
        let earlyDataHeaderName = '';

        if (path.includes('?ed=')) {
            const [pathPart, edPart] = path.split('?ed=');
            path = pathPart;
            maxEarlyData = parseInt(edPart.split('/')[0]);
            earlyDataHeaderName = 'Sec-WebSocket-Protocol';
        }

        if (tls) {
            node.tls = true;
            if (type === 'trojan') {
                node.sni = sni;
            } else {
                node.servername = sni;
            }
            if (alpn) {
                node.alpn = alpn.split(',');
            }
        }

        let netOpts: NetworkConfig = {};

        switch (network) {
            case 'ws':
                netOpts = this.wsConfig(
                    path,
                    host,
                    maxEarlyData,
                    earlyDataHeaderName,
                    isHttpupgrade,
                );
                break;
            case 'tcp':
            case 'raw':
                netOpts = this.tcpConfig(path, host);
                break;
        }

        if (Object.keys(netOpts).length > 0) {
            node[`${network}-opts`] = netOpts;
        }

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
        if (host.network === 'xhttp') {
            return;
        }

        const proxyRemark = host.remark;

        const node = this.makeNode({
            name: host.remark,
            remark: proxyRemark,
            type: host.protocol,
            server: host.address,
            port: host.port,
            network: host.network || 'tcp',
            tls: ['reality', 'tls'].includes(host.tls),
            sni: host.sni,
            host: host.host[0],
            path: host.path,
            headers: '',
            udp: true,
            alpn: host.alpn,
            fp: host.fingerprint,
            pbk: host.publicKey,
            sid: host.shortId,
        });

        switch (host.protocol) {
            case 'vless':
                node.uuid = host.password.vlessPassword;
                node.flow = 'xtls-rprx-vision';

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
                node.password = host.password.ssPassword;
                node.cipher = 'chacha20-ietf-poly1305';
                break;
            default:
                return;
        }

        this.data.proxies.push(node);
        this.proxyRemarks.push(proxyRemark);
    }
}
