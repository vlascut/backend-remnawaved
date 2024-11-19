import { readFileSync } from 'fs';
import { IXrayConfig, InboundSettings, Certificate, UserWithSettings } from './interfaces';

export class XRayConfig {
    private config: IXrayConfig;
    private inbounds: InboundSettings[] = [];
    private inboundsByProtocol: Record<string, InboundSettings[]> = {};
    private inboundsByTag: Record<string, InboundSettings> = {};
    private readonly CONFIG_KEY_ORDER = [
        'log',
        'api',
        'dns',
        'inbounds',
        'outbounds',
        'routing',
        'policy',
        'transport',
        'stats',
        'reverse',
        'fakedns',
        'metrics',
        'observatory',
        'burstObservatory',
    ];

    constructor(configInput: string | Record<string, any>) {
        let config: Record<string, any>;

        if (typeof configInput === 'string') {
            try {
                config = JSON.parse(configInput);
            } catch (error) {
                throw new Error('Invalid JSON input or file path.');
            }
        } else if (typeof configInput === 'object') {
            config = { ...configInput };
        } else {
            throw new Error('Invalid configuration format.');
        }

        this.config = config as IXrayConfig;
        this.validate();
        this.resolveInbounds();
    }
    private validate(): void {
        if (!this.config.inbounds || this.config.inbounds.length === 0) {
            throw new Error("Config doesn't have inbounds.");
        }

        if (!this.config.outbounds || this.config.outbounds.length === 0) {
            throw new Error("Config doesn't have outbounds.");
        }

        for (const inbound of this.config.inbounds) {
            if (!inbound.tag) {
                throw new Error('All inbounds must have a unique tag.');
            }
            if (inbound.tag.includes(',')) {
                throw new Error("Character ',' is not allowed in inbound tag.");
            }
        }

        for (const outbound of this.config.outbounds) {
            if (!outbound.tag) {
                throw new Error('All outbounds must have a unique tag.');
            }
        }
    }

    private resolveInbounds(): void {
        for (const inbound of this.config.inbounds) {
            const settings: InboundSettings = {
                tag: inbound.tag,
                protocol: inbound.protocol,
                ...inbound,
            };

            this.inbounds.push(settings);
            this.inboundsByTag[inbound.tag] = settings;
            if (!this.inboundsByProtocol[settings.protocol]) {
                this.inboundsByProtocol[settings.protocol] = [];
            }
            this.inboundsByProtocol[settings.protocol!].push(settings);
        }
    }

    getInbound(tag: string): any {
        return this.config.inbounds.find((inbound) => inbound.tag === tag);
    }

    getInbounds(): InboundSettings[] {
        return this.inbounds;
    }

    getOutbound(tag: string): any {
        return this.config.outbounds.find((outbound) => outbound.tag === tag);
    }

    getConfig(): IXrayConfig {
        return this.config;
    }

    getAllTags(): string[] {
        return this.inbounds.map((inbound) => inbound.tag);
    }

    getInboundByProtocol(protocol: string): InboundSettings[] {
        return this.inboundsByProtocol[protocol] || [];
    }

    toJSON(): string {
        return JSON.stringify(this.config, null, 2);
    }

    public includeUsers(users: UserWithSettings[]): IXrayConfig {
        const config = structuredClone(this.config);

        const inboundMap = new Map(config.inbounds.map((inbound) => [inbound.tag, inbound]));

        for (const user of users) {
            const inbound = inboundMap.get(user.tag);
            if (!inbound) continue;

            inbound.settings ??= {};
            inbound.settings.clients ??= [];

            switch (inbound.protocol) {
                case 'trojan':
                    inbound.settings.clients.push({
                        password: user.password,
                        email: `${user.username}`,
                    });
                    break;
                case 'vless':
                    inbound.settings.clients.push({
                        id: user.password,
                        email: `${user.username}`,
                        flow: user.flowXtlsVision ? 'xtls-rprx-vision' : '',
                    });
                    break;
                default:
                    throw new Error(`Protocol ${inbound.protocol} is not supported.`);
            }
        }

        return config;
    }

    private processCertificates(config: IXrayConfig): IXrayConfig {
        const newConfig = config;

        for (const inbound of newConfig.inbounds) {
            const tlsSettings = inbound?.streamSettings?.tlsSettings;
            if (!tlsSettings?.certificates) continue;

            tlsSettings.certificates = tlsSettings.certificates.map((cert: Certificate) => {
                try {
                    const newCert = { ...cert };

                    if (newCert.certificateFile) {
                        const certContent = readFileSync(newCert.certificateFile, 'utf-8')
                            .replace(/\r\n/g, '\n')
                            .split('\n')
                            .filter((line) => line);
                        newCert.certificate = certContent;
                        delete newCert.certificateFile;
                    }

                    if (newCert.keyFile) {
                        const keyContent = readFileSync(newCert.keyFile, 'utf-8')
                            .replace(/\r\n/g, '\n')
                            .split('\n')
                            .filter((line) => line);
                        newCert.key = keyContent;
                        delete newCert.keyFile;
                    }

                    return newCert;
                } catch (error) {
                    // console.error(
                    //     `Failed to read certificate files for inbound ${inbound.tag}:`,
                    //     error,
                    // );
                    return cert;
                }
            });
        }

        return newConfig;
    }

    public prepareConfigForNode(users: UserWithSettings[]): IXrayConfig {
        const configWithUsers = this.includeUsers(users);
        const configWithCertificatesAndUsers = this.processCertificates(configWithUsers);
        return configWithCertificatesAndUsers;
    }

    private sortObjectByKeys<T extends { [key: string]: any }>(obj: T): T {
        const sortedObj: { [key: string]: any } = {};

        for (const key of this.CONFIG_KEY_ORDER) {
            if (key in obj) {
                sortedObj[key] = obj[key];
            }
        }

        for (const key in obj) {
            if (!(key in sortedObj)) {
                sortedObj[key] = obj[key];
            }
        }

        return sortedObj as T;
    }

    public getSortedConfig(): IXrayConfig {
        return this.sortObjectByKeys(this.config);
    }
}
