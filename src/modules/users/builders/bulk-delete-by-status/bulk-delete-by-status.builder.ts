import { TUsersStatus } from '@libs/contracts/constants';
import { Prisma } from '@prisma/client';

export class BulkDeleteByStatusBuilder {
    public query: Prisma.Sql;

    constructor(status: TUsersStatus) {
        this.query = this.getQuery(status);
        return this;
    }

    public getQuery(status: TUsersStatus): Prisma.Sql {
        const query = `
        DELETE FROM users
        WHERE "status" = '${status}';
    `;
        return Prisma.raw(query);
    }
}
