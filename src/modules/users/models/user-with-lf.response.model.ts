import { GetInboundsResponseModel } from 'src/modules/inbounds/models/get-inbounds.response.model';
import { TResetPeriods, TUsersStatus } from '@libs/contracts/constants';

import { UserWithLifetimeTrafficEntity } from '../entities/user-with-lifetime-traffic.entity';
import { ILastConnectedNode } from '@modules/nodes-user-usage-history/interfaces/last-connected-node';

export class UserWithLifetimeTrafficResponseModel {
    public uuid: string;
    public subscriptionUuid: string;
    public shortUuid: string;
    public username: string;
    public status: TUsersStatus;
    public usedTrafficBytes: number;
    public lifetimeUsedTrafficBytes: number;
    public trafficLimitBytes: number;
    public trafficLimitStrategy: TResetPeriods;
    public subLastUserAgent: string;
    public subLastOpenedAt: Date;

    public expireAt: Date;
    public onlineAt: Date;
    public subRevokedAt: Date | null;
    public lastTrafficResetAt: Date | null;

    public trojanPassword: string;
    public vlessUuid: string;
    public ssPassword: string;

    public createdAt: Date;
    public updatedAt: Date;

    public activeUserInbounds: GetInboundsResponseModel[];

    public subscriptionUrl: string;
    public lastConnectedNode: null | ILastConnectedNode;
    public description: null | string;

    public telegramId: number | null;
    public email: string | null;

    constructor(data: UserWithLifetimeTrafficEntity, subPublicDomain: string) {
        this.uuid = data.uuid;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.subscriptionUuid = data.subscriptionUuid;
        this.shortUuid = data.shortUuid;
        this.username = data.username;
        this.status = data.status;
        this.usedTrafficBytes = Number(data.usedTrafficBytes);
        this.lifetimeUsedTrafficBytes = Number(data.lifetimeUsedTrafficBytes);
        this.trafficLimitBytes = Number(data.trafficLimitBytes);
        this.trafficLimitStrategy = data.trafficLimitStrategy;
        this.subLastUserAgent = data.subLastUserAgent;
        this.subLastOpenedAt = data.subLastOpenedAt;
        this.expireAt = data.expireAt;
        this.onlineAt = data.onlineAt;
        this.subRevokedAt = data.subRevokedAt;
        this.lastTrafficResetAt = data.lastTrafficResetAt;
        this.trojanPassword = data.trojanPassword;
        this.vlessUuid = data.vlessUuid;
        this.ssPassword = data.ssPassword;
        this.activeUserInbounds = data.activeUserInbounds.map(
            (item) => new GetInboundsResponseModel(item),
        );
        this.lastConnectedNode = data.lastConnectedNode;

        this.description = data.description;

        this.telegramId = data.telegramId ? Number(data.telegramId) : null;
        this.email = data.email;

        this.subscriptionUrl = `https://${subPublicDomain}/${this.shortUuid}`;

        return this;
    }
}
