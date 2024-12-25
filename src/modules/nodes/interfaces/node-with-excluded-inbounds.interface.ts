import { Prisma } from '@prisma/client';

export type INodeWithExcludedInbounds = Prisma.NodesGetPayload<{
    include: {
        inboundsExclusions: {
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
