import { Prisma } from '@prisma/client';

export interface IUserWithLifetimeTraffic
    extends Prisma.UsersGetPayload<{
        include: {
            activeUserInbounds: {
                select: {
                    inbound: {
                        select: {
                            uuid: true;
                            tag: true;
                            type: true;
                        };
                    };
                };
            };
        };
    }> {
    totalUsedBytes?: string | number | bigint | null | undefined;
}
