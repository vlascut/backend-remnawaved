import { ConfigService } from '@nestjs/config';
import { XRayConfig } from '../../../../common/helpers/xray-config';
import { HostWithInboundTagEntity } from '../../../hosts/entities/host-with-inbound-tag.entity';
import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';

export interface IGenerateSubscription {
    userAgent: string;
    user: UserWithActiveInboundsEntity;
    config: XRayConfig;
    configService: ConfigService;
    hosts: HostWithInboundTagEntity[];
}
