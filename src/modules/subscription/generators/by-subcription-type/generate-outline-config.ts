import { FormattedHosts } from '../interfaces/formatted-hosts.interface';

interface OutlineOutbound {
    method: string;
    password: string;
    server: string;
    server_port: number;
    tag: string;
}

export class OutlineConfiguration {
    private hosts: FormattedHosts[];
    private config: OutlineOutbound = {} as OutlineOutbound;
    private decodedTag: string;
    constructor(hosts: FormattedHosts[], decodedTag?: string) {
        this.hosts = hosts;
        this.decodedTag = decodedTag || '';
    }

    private generate(): string {
        for (const host of this.hosts) {
            if (!host || host.protocol !== 'shadowsocks') {
                continue;
            }

            const outbound = this.makeOutbound(
                host.remark,
                host.address,
                host.port,
                host.password.ssPassword,
                'chacha20-ietf-poly1305',
            );

            if (this.decodedTag && this.decodedTag === outbound.tag) {
                this.addDirectly(outbound);

                break;
            }
        }

        return this.render();
    }

    private addDirectly(outbound: OutlineOutbound): void {
        // Просто обновляем объект конфига
        Object.assign(this.config, outbound);
    }

    public static generateConfig(hosts: FormattedHosts[], encodedTag?: string): string {
        try {
            const decodedTag = encodedTag
                ? Buffer.from(encodedTag, 'base64').toString('utf-8')
                : '';
            return new OutlineConfiguration(hosts, decodedTag).generate();
        } catch {
            return '';
        }
    }

    private render(): string {
        return JSON.stringify(this.config, null, 0);
    }

    private makeOutbound(
        remark: string,
        server: string,
        server_port: number,
        password: string,
        method: string,
    ): OutlineOutbound {
        return {
            method,
            password,
            server,
            server_port,
            tag: remark,
        };
    }
}
