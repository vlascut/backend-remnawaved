import { Prisma } from '@prisma/client';

export type IUserWithActiveInbounds = Prisma.UsersGetPayload<{
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
}>;
