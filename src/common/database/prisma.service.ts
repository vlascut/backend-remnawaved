import {
    CamelCasePlugin,
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import kyselyExtension from 'prisma-extension-kysely';
import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';

import { DB } from 'prisma/generated/types';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private constructor(config: ConfigService) {
        // const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        super({
            // log: ['query'],
            // adapter,
        });
        // init with config
    }

    /**
     * @see https://github.com/eoin-obrien/prisma-extension-kysely
     * @see https://github.com/eoin-obrien/prisma-extension-kysely/issues/71
     */
    static withKysely(config: ConfigService) {
        return new PrismaService(config).$extends(
            kyselyExtension({
                kysely: (driver) => {
                    return new Kysely<DB>({
                        log: ['query'],
                        dialect: {
                            createDriver: () => driver,
                            createAdapter: () => new PostgresAdapter(),
                            createIntrospector: (db) => new PostgresIntrospector(db),
                            createQueryCompiler: () => new PostgresQueryCompiler(),
                        },
                        plugins: [new CamelCasePlugin()],
                    });
                },
            }),
        ) as unknown as PrismaService;
    }

    /** Don't forget it */
    declare $kysely: Kysely<DB>;
}
