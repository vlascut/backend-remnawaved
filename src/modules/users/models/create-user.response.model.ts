import { TResetPeriods, TUsersStatus } from '@libs/contracts/constants';
import { InboundsEntity } from '../../inbounds/entities/inbounds.entity';
import { UserWithActiveInboundsEntity } from '../entities/user-with-active-inbounds.entity';

export class CreateUserResponseModel {
    public readonly uuid: string;
    public readonly username: string;
    public readonly shortUuid: string;
    public readonly status: TUsersStatus;
    public readonly expireAt: Date;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;
    public readonly subscriptionUuid: string;
    public readonly usedTrafficBytes: number;
    public readonly lifetimeUsedTrafficBytes: number;
    public readonly trafficLimitBytes: number;
    public readonly trafficLimitStrategy: TResetPeriods;
    public readonly subLastUserAgent: string | null;
    public readonly subLastOpenedAt: Date | null;
    public readonly onlineAt: Date | null;
    public readonly subRevokedAt: Date | null;
    public readonly lastTrafficResetAt: Date | null;
    public readonly activeUserInbounds: InboundsEntity[];
    public readonly trojanPassword: string;
    public readonly vlessUuid: string;
    public readonly ssPassword: string;

    constructor(entity: UserWithActiveInboundsEntity) {
        this.uuid = entity.uuid;
        this.username = entity.username;
        this.shortUuid = entity.shortUuid;
        this.status = entity.status;
        this.expireAt = entity.expireAt;
        this.createdAt = entity.createdAt;
        this.updatedAt = entity.updatedAt;
        this.subscriptionUuid = entity.subscriptionUuid;
        this.usedTrafficBytes = Number(entity.usedTrafficBytes);
        this.lifetimeUsedTrafficBytes = Number(entity.lifetimeUsedTrafficBytes);
        this.trafficLimitBytes = Number(entity.trafficLimitBytes);
        this.trafficLimitStrategy = entity.trafficLimitStrategy;
        this.subLastUserAgent = entity.subLastUserAgent;
        this.subLastOpenedAt = entity.subLastOpenedAt;
        this.onlineAt = entity.onlineAt;
        this.subRevokedAt = entity.subRevokedAt;
        this.lastTrafficResetAt = entity.lastTrafficResetAt;
        this.activeUserInbounds = entity.activeUserInbounds;
        this.trojanPassword = entity.trojanPassword;
        this.vlessUuid = entity.vlessUuid;
        this.ssPassword = entity.ssPassword;
    }
}
