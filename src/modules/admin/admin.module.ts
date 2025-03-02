import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { PrismaModule } from '@common/database';

import { AdminRepository } from './repositories/admin.repository';
import { AdminConverter } from './admin.converter';
import { QUERIES } from './queries';
import { COMMANDS } from './commands';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [],
    providers: [AdminRepository, AdminConverter, ...QUERIES, ...COMMANDS],
})
export class AdminModule {}
