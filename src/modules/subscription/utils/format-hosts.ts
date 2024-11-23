import dayjs from 'dayjs';
import { XRayConfig } from '../../../common/helpers/xray-config/xray-config.validator';
import { TemplateEngine } from '../../../common/utils/templates/replace-templates-values';
import { HostWithInboundTagEntity } from '../../hosts/entities/host-with-inbound-tag.entity';
import { UserWithActiveInboundsEntity } from '../../users/entities/user-with-active-inbounds.entity';
import { FormattedHosts } from '../generators/interfaces/formatted-hosts.interface';
import prettyBytes from 'pretty-bytes';
import { USER_STATUSES_TEMPLATE } from '@libs/contracts/constants/templates/user-statuses';
import { ConfigService } from '@nestjs/config';
import { USERS_STATUS } from '../../../../libs/contract';
import { v4 as uuidv4 } from 'uuid';
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
                    pbk: '',
                    fp: '',
                    sid: '',
                    spx: '',
                    ais: false,
                    network: 'tcp',
                    password: {
                        trojanPassword: '00000',
                        vlessPassword: uuidv4(),
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
                TRAFFIC_USED: prettyBytes(Number(this.user.usedTrafficBytes)),
                TRAFFIC_LEFT: prettyBytes(
                    Number(this.user.trafficLimitBytes) - Number(this.user.usedTrafficBytes),
                ),
                STATUS: USER_STATUSES_TEMPLATE[this.user.status],
            });
            const address = inputHost.address;
            const port = inputHost.port;
            const network = inbound.streamSettings?.network;
            const protocol = inbound.protocol;
            const path =
                inputHost.path ||
                inbound.streamSettings?.wsSettings?.path ||
                inbound.streamSettings?.httpSettings?.path ||
                '';

            const host = inputHost.host || inbound.streamSettings?.httpSettings?.host || '';
            const tls = inbound.streamSettings?.security || 'tls';

            const sni = inputHost.sni || '';

            const fp =
                inputHost.fingerprint || inbound.streamSettings?.tlsSettings?.fingerprint || '';

            const alpn =
                inputHost.alpn || inbound.streamSettings?.tlsSettings?.alpn?.join(',') || '';

            const pbk = inbound.streamSettings?.realitySettings?.privateKey || '';

            const sid = inbound.streamSettings?.realitySettings?.shortIds?.join(',') || '';

            const spx = inbound.streamSettings?.realitySettings?.spiderX || '';

            const ais = inputHost.allowInsecure ? true : false;

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
                pbk,
                fp,
                sid,
                spx,
                ais,
                network,
                password: {
                    trojanPassword: this.user.trojanPassword,
                    vlessPassword: this.user.vlessUuid,
                },
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
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}
