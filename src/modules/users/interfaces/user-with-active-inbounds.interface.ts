import { Prisma } from '@prisma/client';

export interface IUserWithActiveInbounds
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
    }> {}
