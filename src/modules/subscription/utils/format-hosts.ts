import { randomUUID } from 'node:crypto';
import dayjs from 'dayjs';

import { ConfigService } from '@nestjs/config';

import {
    RawObject,
    StreamSettingsObject,
    TcpObject,
    WebSocketObject,
} from '@common/helpers/xray-config/interfaces/transport.config';
import { xHttpObject } from '@common/helpers/xray-config/interfaces/transport.config';
import { TemplateEngine } from '@common/utils/templates/replace-templates-values';
import { XRayConfig } from '@common/helpers/xray-config/xray-config.validator';
import { prettyBytesUtil } from '@common/utils/bytes/pretty-bytes.util';
import { USER_STATUSES_TEMPLATE } from '@libs/contracts/constants/templates/user-statuses';
import { USERS_STATUS } from '@libs/contracts/constants';

import { UserWithActiveInboundsEntity } from '../../users/entities/user-with-active-inbounds.entity';
import { HostWithInboundTagEntity } from '../../hosts/entities/host-with-inbound-tag.entity';
import { FormattedHosts } from '../generators/interfaces/formatted-hosts.interface';

export class FormatHosts {
    private config: XRayConfig;
    private hosts: HostWithInboundTagEntity[];
    private user: UserWithActiveInboundsEntity;
    private configService: ConfigService;

    constructor(
        config: XRayConfig,
        hosts: HostWithInboundTagEntity[],
        user: UserWithActiveInboundsEntity,
        configService: ConfigService,
    ) {
        this.config = config;
        this.hosts = hosts;
        this.user = user;
        this.configService = configService;
    }

    private generate(): FormattedHosts[] {
        const formattedHosts: FormattedHosts[] = [];

        let specialRemarks: string[] = [];

        if (this.user.status !== USERS_STATUS.ACTIVE) {
            switch (this.user.status) {
                case USERS_STATUS.EXPIRED:
                    specialRemarks = this.configService.getOrThrow('EXPIRED_USER_REMARKS');
                    break;
                case USERS_STATUS.DISABLED:
                    specialRemarks = this.configService.getOrThrow('DISABLED_USER_REMARKS');
                    break;
                case USERS_STATUS.LIMITED:
                    specialRemarks = this.configService.getOrThrow('LIMITED_USER_REMARKS');
                    break;
            }

            specialRemarks.forEach((remark) => {
                formattedHosts.push({
                    remark,
                    address: '0.0.0.0',
                    port: 0,
                    protocol: 'trojan',
                    path: '',
                    host: '',
                    tls: 'tls',
                    sni: '',
                    alpn: '',
                    publicKey: '',
                    fingerprint: '',
                    shortId: '',
                    spiderX: '',
                    network: 'tcp',
                    password: {
                        trojanPassword: '00000',
                        vlessPassword: randomUUID(),
                        ssPassword: '00000',
                    },
                });
            });

            return formattedHosts;
        }

        for (const inputHost of this.hosts) {
            const inbound = this.config.getInbound(inputHost.inboundTag.tag);

            if (!inbound) {
                continue;
            }

            const remark = TemplateEngine.replace(inputHost.remark, {
                DAYS_LEFT: dayjs(this.user.expireAt).diff(dayjs(), 'day'),
                TRAFFIC_USED: prettyBytesUtil(this.user.usedTrafficBytes, true, 3),
                TRAFFIC_LEFT: prettyBytesUtil(
                    this.user.trafficLimitBytes - this.user.usedTrafficBytes,
                    true,
                    3,
                ),
                TOTAL_TRAFFIC: prettyBytesUtil(this.user.trafficLimitBytes, true, 3),
                STATUS: USER_STATUSES_TEMPLATE[this.user.status],
            });

            const address = inputHost.address;
            const port = inputHost.port;
            const network = inbound.streamSettings?.network || 'tcp';

            let streamSettings: WebSocketObject | xHttpObject | RawObject | TcpObject | undefined;
            let pathFromConfig: string | undefined;
            let hostFromConfig: string | undefined;
            let additionalParams: FormattedHosts['additionalParams'] | undefined;
            let headerType: string | undefined;

            switch (network) {
                case 'xhttp': {
                    const settings = inbound.streamSettings?.xhttpSettings as xHttpObject;
                    streamSettings = settings;
                    pathFromConfig = settings?.path;
                    hostFromConfig = settings?.host;
                    additionalParams = {
                        scMaxEachPostBytes: settings?.extra?.scMaxEachPostBytes || 1000000,
                        scMaxBufferedPosts: settings?.extra?.scMaxBufferedPosts || 1000000,
                        scMaxConcurrentPosts: settings?.extra?.scMaxConcurrentPosts || 100,
                        scMinPostsIntervalMs: settings?.extra?.scMinPostsIntervalMs || 30,
                        xPaddingBytes: settings?.extra?.xPaddingBytes || '100-1000',
                        noGRPCHeader: settings?.extra?.noGRPCHeader || false,
                        heartbeatPeriod: settings?.extra?.heartbeatPeriod || undefined,
                        mode: settings?.mode || 'auto',
                    };

                    break;
                }
                case 'ws': {
                    const settings = inbound.streamSettings?.wsSettings as WebSocketObject;
                    streamSettings = settings;
                    pathFromConfig = settings?.path;
                    break;
                }
                case 'raw':
                    streamSettings = inbound.streamSettings?.rawSettings as RawObject;
                    break;
                case 'tcp': {
                    if (inbound.protocol === 'shadowsocks') {
                        break;
                    }

                    const settings = inbound.streamSettings?.tcpSettings as TcpObject;
                    // eslint-disable-next-line
                    streamSettings = settings;
                    headerType = settings?.header?.type;

                    break;
                }
            }

            let tlsFromConfig: StreamSettingsObject['security'] | undefined | '';
            let sniFromConfig: string | undefined;
            let fingerprintFromConfig: string | undefined;
            let alpnFromConfig: string | undefined;
            let publicKeyFromConfig: string | undefined;
            let shortIdFromConfig: string | undefined;
            let spiderXFromConfig: string | undefined;

            switch (inbound.streamSettings?.security) {
                case 'tls':
                    tlsFromConfig = 'tls';
                    const tlsSettings = inbound.streamSettings?.tlsSettings;
                    sniFromConfig = tlsSettings?.serverName;
                    fingerprintFromConfig = tlsSettings?.fingerprint;
                    alpnFromConfig = tlsSettings?.alpn?.join(',');
                    break;
                case 'reality':
                    tlsFromConfig = 'reality';
                    const realitySettings = inbound.streamSettings?.realitySettings;
                    sniFromConfig = realitySettings?.serverNames?.[0];
                    fingerprintFromConfig = realitySettings?.fingerprint;
                    publicKeyFromConfig = realitySettings?.publicKey;
                    spiderXFromConfig = realitySettings?.spiderX;
                    const shortIds = inbound.streamSettings?.realitySettings?.shortIds || [];
                    shortIdFromConfig =
                        shortIds.length > 0
                            ? shortIds[Math.floor(Math.random() * shortIds.length)]
                            : '';

                    break;
                case 'none':
                    tlsFromConfig = 'none';
                    break;
                default:
                    tlsFromConfig = '';
                    break;
            }

            const protocol = inbound.protocol;
            const path = inputHost.path || pathFromConfig || '';

            const host = inputHost.host || hostFromConfig || '';

            const tls = tlsFromConfig;

            const isDomain = (str: string): boolean => {
                const domainRegex =
                    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
                return domainRegex.test(str);
            };

            let sni = inputHost.sni || sniFromConfig;

            if (!sni) {
                sni = '';
            }

            if (!sni && isDomain(inputHost.address)) {
                sni = inputHost.address;
            }

            const fp = inputHost.fingerprint || fingerprintFromConfig || '';

            const alpn = inputHost.alpn || alpnFromConfig || '';

            // Public key
            const pbk = publicKeyFromConfig || '';

            // Short ID
            const sid = shortIdFromConfig || '';

            const spiderX = spiderXFromConfig || '';

            formattedHosts.push({
                remark,
                address,
                port,
                protocol,
                path,
                host,
                tls,
                sni,
                alpn,
                publicKey: pbk,
                fingerprint: fp,
                shortId: sid,
                headerType,
                spiderX,
                network,
                password: {
                    trojanPassword: this.user.trojanPassword,
                    vlessPassword: this.user.vlessUuid,
                    ssPassword: this.user.ssPassword,
                },
                additionalParams,
            });
        }

        return formattedHosts;
    }

    public static format(
        config: XRayConfig,
        hosts: HostWithInboundTagEntity[],
        user: UserWithActiveInboundsEntity,
        configService: ConfigService,
    ): FormattedHosts[] {
        try {
            return new FormatHosts(config, hosts, user, configService).generate();
        } catch {
            // silence error
            return [];
        }
    }
}
