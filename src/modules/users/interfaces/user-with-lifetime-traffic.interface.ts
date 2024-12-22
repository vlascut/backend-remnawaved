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
        };
    }> {
    totalUsedBytes?: bigint | null | number | string | undefined;
}
