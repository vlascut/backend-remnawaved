// import { PrismaClient } from '@prisma/client';
import { Kysely } from 'kysely';

import { DB } from 'prisma/generated/types';

// Расширяем PrismaClient для транзакций
declare module '@prisma/client' {
    interface PrismaClient {
        $kysely: Kysely<DB>;
    }
}

// // Альтернативно, если нужно для транзакционного адаптера:
// declare module '@nestjs-cls/transactional-adapter-prisma' {
//     interface TransactionalAdapterPrisma {
//         tx: {
//             $kysely: Kysely<DB>;
//         } & PrismaClient;
//     }
// }
