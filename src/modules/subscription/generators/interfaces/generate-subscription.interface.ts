import { ConfigService } from '@nestjs/config';

import { XRayConfig } from '@common/helpers/xray-config';

import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';
import { HostWithInboundTagEntity } from '../../../hosts/entities/host-with-inbound-tag.entity';

export interface IGenerateSubscription {
    config: XRayConfig;
    configService: ConfigService;
    hosts: HostWithInboundTagEntity[];
    user: UserWithActiveInboundsEntity;
    userAgent: string;
}
