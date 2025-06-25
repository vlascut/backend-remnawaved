import { HostWithRawInbound } from '@modules/hosts/entities/host-with-inbound-tag.entity';
import { UserEntity } from '@modules/users/entities/user.entity';

export interface IGenerateSubscription {
    userAgent: string;
    user: UserEntity;
    hosts: HostWithRawInbound[];
    isOutlineConfig: boolean;
    encodedTag?: string;
    needJsonSubscription?: boolean;
}
