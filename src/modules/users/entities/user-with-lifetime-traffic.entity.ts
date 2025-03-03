import { ILastConnectedNode } from '@modules/nodes-user-usage-history/interfaces/last-connected-node';
import { InboundsEntity } from '@modules/inbounds/entities';
import { TResetPeriods } from '@libs/contracts/constants';
import { TUsersStatus } from '@libs/contracts/constants';

import { IUserWithLifetimeTraffic } from '../interfaces';

export class UserWithLifetimeTrafficEntity {
    public uuid: string;
    public subscriptionUuid: string;
    public shortUuid: string;
    public username: string;
    public status: TUsersStatus;
    public usedTrafficBytes: bigint;
    public lifetimeUsedTrafficBytes: bigint;
    public trafficLimitBytes: bigint;
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

    public description: null | string;

    public telegramId: bigint | null;
    public email: string | null;

    public createdAt: Date;
    public updatedAt: Date;

    public activeUserInbounds: InboundsEntity[];

    public lastConnectedNode: null | ILastConnectedNode;

    constructor(user: Partial<IUserWithLifetimeTraffic>) {
        Object.assign(this, user);

        if (user.activeUserInbounds) {
            this.activeUserInbounds = user.activeUserInbounds.map((item) => ({
                uuid: item.inbound.uuid,
                tag: item.inbound.tag,
                type: item.inbound.type,
                network: item.inbound.network,
                security: item.inbound.security,
            }));
        }

        if (user.nodesUserUsageHistory && user.nodesUserUsageHistory.length > 0) {
            this.lastConnectedNode = {
                nodeName: user.nodesUserUsageHistory[0].node.name,
                connectedAt: user.nodesUserUsageHistory[0].updatedAt,
            };
        } else {
            this.lastConnectedNode = null;
        }

        return this;
    }
}
