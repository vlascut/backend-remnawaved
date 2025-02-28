import { Prisma } from '@prisma/client';

export interface IUserWithLifetimeTraffic
    extends Prisma.UsersGetPayload<{
        include: {
            activeUserInbounds: {
                select: {
                    inbound: {
                        select: {
                            tag: true;
                            type: true;
                            uuid: true;
                            network: true;
                            security: true;
                        };
                    };
                };
            };
            nodesUserUsageHistory: {
                orderBy: {
                    updatedAt: 'desc';
                };
                select: {
                    node: {
                        select: {
                            name: true;
                        };
                    };
                    updatedAt: true;
                };
                take: 1;
            };
        };
    }> {
    totalUsedBytes?: bigint | null | number | string | undefined;
}

export const USER_WITH_LIFETIME_TRAFFIC_INCLUDE = {
    activeUserInbounds: {
        select: {
            inbound: {
                select: {
                    uuid: true,
                    tag: true,
                    type: true,
                    network: true,
                    security: true,
                },
            },
        },
    },
    nodesUserUsageHistory: {
        orderBy: {
            updatedAt: 'desc',
        },
        select: {
            node: {
                select: {
                    name: true,
                },
            },
            updatedAt: true,
        },
        take: 1,
    },
} as const;
