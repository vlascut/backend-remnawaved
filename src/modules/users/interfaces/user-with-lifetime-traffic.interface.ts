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
