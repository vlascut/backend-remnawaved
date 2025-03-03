import { readFileSync } from 'fs';

import { getVlessFlow } from '@common/utils/flow/get-vless-flow';

import { InboundsWithTagsAndType } from '@modules/inbounds/interfaces/inbounds-with-tags-and-type.interface';
import { UserForConfigEntity } from '@modules/users/entities/users-for-config';

import {
    CertificateObject as Certificate,
    InboundObject as Inbound,
    InboundSettings,
    IXrayConfig,
    ShadowsocksSettings,
    TCtrXRayConfig,
    TrojanSettings,
    VLessSettings,
} from './interfaces';

export class XRayConfig {
    private config: IXrayConfig;
    private inbounds: Inbound[] = [];
    private inboundsByProtocol: Record<string, Inbound[]> = {};
    private inboundsByTag: Record<string, Inbound> = {};
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

    constructor(configInput: TCtrXRayConfig) {
        this.config = this.prevValidateConfig(configInput);
        this.validate();
        this.resolveInbounds();
    }

    private prevValidateConfig(configInput: TCtrXRayConfig): IXrayConfig {
        let config: IXrayConfig | undefined;

        if (typeof configInput === 'string') {
            try {
                config = JSON.parse(configInput) as IXrayConfig;
            } catch (error) {
                throw new Error(`Invalid JSON input or file path: ${error}`);
            }
        } else if (typeof configInput === 'object') {
            config = configInput as IXrayConfig;
        } else {
            throw new Error('Invalid configuration format.');
        }

        return config;
    }

    private validate(): void {
        if (!this.config.inbounds || this.config.inbounds.length === 0) {
            throw new Error("Config doesn't have inbounds.");
        }

        for (const inbound of this.config.inbounds) {
            const network = inbound.streamSettings?.network;

            if (network && !['raw', 'tcp', 'ws', 'xhttp'].includes(network)) {
                throw new Error(
                    `Invalid network type "${network}" in inbound "${inbound.tag}". Allowed values are: raw, xhttp, ws, tcp`,
                );
            }

            if (!['shadowsocks', 'trojan', 'vless'].includes(inbound.protocol)) {
                throw new Error(
                    `Invalid protocol in inbound "${inbound.tag}". Allowed values are: shadowsocks, trojan, vless`,
                );
            }

            // console.log(`Inbound ${inbound.tag} network: ${network || 'not set'}`);
        }

        for (const inbound of this.config.inbounds) {
            if (!inbound.tag) {
                throw new Error('All inbounds must have a unique tag.');
            }
            if (inbound.tag.includes(',')) {
                throw new Error("Character ',' is not allowed in inbound tag.");
            }
        }
    }

    private resolveInbounds(): void {
        for (const inbound of this.config.inbounds) {
            const settings: Inbound = {
                ...inbound,
                tag: inbound.tag,
                protocol: inbound.protocol,
            };

            this.inbounds.push(settings);
            this.inboundsByTag[inbound.tag] = settings;
            if (!this.inboundsByProtocol[settings.protocol]) {
                this.inboundsByProtocol[settings.protocol] = [];
            }
            this.inboundsByProtocol[settings.protocol!].push(settings);
        }
    }

    public static getXrayConfigInstance(config: TCtrXRayConfig): XRayConfig {
        return new XRayConfig(config);
    }

    public getInbound(tag: string): Inbound | undefined {
        return this.config.inbounds.find((inbound) => inbound.tag === tag);
    }

    private getInbounds(): Inbound[] {
        return this.inbounds;
    }

    private getConfig(): IXrayConfig {
        return this.config;
    }

    private getInboundByProtocol(protocol: string): Inbound[] {
        return this.inboundsByProtocol[protocol] || [];
    }

    private toJSON(): string {
        return JSON.stringify(this.config, null, 2);
    }

    private sortObjectByKeys<T extends IXrayConfig>(obj: T): T {
        const sortedObj = {} as Record<string, unknown>;

        for (const key of this.CONFIG_KEY_ORDER) {
            if (key in obj) {
                sortedObj[key] = obj[key as keyof T];
            }
        }

        for (const key in obj) {
            if (!(key in sortedObj)) {
                sortedObj[key] = obj[key];
            }
        }

        return sortedObj as T;
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
                } catch {
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

    public getAllInbounds(): InboundsWithTagsAndType[] {
        return this.inbounds.map((inbound) => ({
            tag: inbound.tag,
            type: inbound.protocol,
            network: inbound.streamSettings?.network ?? null,
            security: inbound.streamSettings?.security ?? null,
        }));
    }

    public includeUsers(users: UserForConfigEntity[]): IXrayConfig {
        const config = JSON.parse(JSON.stringify(this.config)) as IXrayConfig;

        const inboundMap = new Map(config.inbounds.map((inbound) => [inbound.tag, inbound]));

        const usersByTag = new Map<string, UserForConfigEntity[]>();
        for (const user of users) {
            if (!usersByTag.has(user.tag)) {
                usersByTag.set(user.tag, []);
            }
            usersByTag.get(user.tag)!.push(user);
        }

        for (const [tag, tagUsers] of usersByTag) {
            const inbound = inboundMap.get(tag);
            if (!inbound) continue;

            inbound.settings ??= {} as InboundSettings;

            this.addUsersToInbound(inbound, tagUsers);
        }

        return config;
    }

    public prepareConfigForNode(users: UserForConfigEntity[]): IXrayConfig {
        const configWithUsers = this.includeUsers(users);
        return this.processCertificates(configWithUsers);
    }

    public getSortedConfig(): IXrayConfig {
        return this.sortObjectByKeys<IXrayConfig>(this.config);
    }

    private addUsersToInbound(inbound: Inbound, users: UserForConfigEntity[]): void {
        switch (inbound.protocol) {
            case 'trojan':
                (inbound.settings as TrojanSettings).clients ??= [];
                for (const user of users) {
                    (inbound.settings as TrojanSettings).clients.push({
                        password: user.trojanPassword,
                        email: `${user.username}`,
                    });
                }
                break;
            case 'vless':
                (inbound.settings as VLessSettings).clients ??= [];
                for (const user of users) {
                    (inbound.settings as VLessSettings).clients.push({
                        id: user.vlessUuid,
                        email: `${user.username}`,
                        flow: getVlessFlow(inbound),
                    });
                }
                break;
            case 'shadowsocks':
                (inbound.settings as ShadowsocksSettings).clients ??= [];
                for (const user of users) {
                    (inbound.settings as ShadowsocksSettings).clients.push({
                        password: user.ssPassword,
                        method: 'chacha20-ietf-poly1305',
                        email: user.username,
                    });
                }
                break;
            default:
                throw new Error(`Protocol ${inbound.protocol} is not supported.`);
        }
    }
}
