import { Injectable, Logger } from '@nestjs/common';

import { IFormattedHost } from './interfaces/formatted-hosts.interface';
import { IRawHost } from './interfaces';

@Injectable()
export class RawHostsGeneratorService {
    private readonly logger = new Logger(RawHostsGeneratorService.name);

    constructor() {}

    public async generateConfig(hosts: IFormattedHost[]): Promise<IRawHost[]> {
        const rawHosts: IRawHost[] = [];
        try {
            for (const host of hosts) {
                if (!host) {
                    continue;
                }

                const rawHost: IRawHost = {
                    ...host,
                    flow: 'xtls-rprx-vision',
                };

                if (
                    !(
                        ['reality', 'tls'].includes(host.tls) &&
                        ['raw', 'tcp'].includes(host.network) &&
                        host.headerType !== 'http'
                    )
                ) {
                    rawHost.flow = undefined;
                }

                if (host.protocol === 'shadowsocks') {
                    rawHost.protocolOptions = {
                        ss: {
                            method: 'chacha20-ietf-poly1305',
                        },
                    };
                }

                rawHosts.push(rawHost);
            }
        } catch (error) {
            this.logger.error('Error generating raw-hosts config:', error);
            return [];
        }

        return rawHosts;
    }
}
