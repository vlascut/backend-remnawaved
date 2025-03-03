import { Prisma } from '@prisma/client';

import { USERS_STATUS } from '@libs/contracts/constants';

import { InboundsEntity } from '@modules/inbounds/entities';

export class UsersWithInboundTagBuilder {
    public query: Prisma.Sql;

    constructor() {
        this.query = this.getQuery();
        return this;
    }

    public getQuery(): Prisma.Sql {
        const query = `
        SELECT 
            u.subscription_uuid as "subscriptionUuid",
            u.username,
            u.trojan_password as "trojanPassword",
            u.vless_uuid as "vlessUuid",
            u.ss_password as "ssPassword",
            i.tag
        FROM users u
        INNER JOIN active_user_inbounds aui 
            ON aui.user_uuid = u.uuid
        INNER JOIN inbounds i 
            ON i.uuid = aui.inbound_uuid
        WHERE u.status = '${USERS_STATUS.ACTIVE}'
    `;

        return Prisma.raw(query);
    }
}

export class UsersWithInboundTagAndExcludedInboundsBuilder {
    public query: Prisma.Sql;
    private excludedInbounds: InboundsEntity[];

    constructor(excludedInbounds: InboundsEntity[]) {
        this.excludedInbounds = excludedInbounds;
        this.query = this.getQuery();
        return this;
    }

    public getQuery(): Prisma.Sql {
        const excludedUuidsCondition =
            this.excludedInbounds.length > 0
                ? `AND i.uuid NOT IN (${this.excludedInbounds.map((inbound) => `'${inbound.uuid}'`).join(',')})`
                : '';

        const query = `
        SELECT 
            u.subscription_uuid as "subscriptionUuid",
            u.username,
            u.trojan_password as "trojanPassword",
            u.vless_uuid as "vlessUuid",
            u.ss_password as "ssPassword",
            i.tag
        FROM users u
        INNER JOIN active_user_inbounds aui 
            ON aui.user_uuid = u.uuid
        INNER JOIN inbounds i 
            ON i.uuid = aui.inbound_uuid
        WHERE u.status = '${USERS_STATUS.ACTIVE}'
            ${excludedUuidsCondition}
        ORDER BY u.created_at ASC
    `;

        return Prisma.raw(query);
    }
}
