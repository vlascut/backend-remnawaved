import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@common/database';
import { UserConverter } from './users.converter';
import { UserRepository } from './repositories/users.repository';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [],
    providers: [UserRepository, UserConverter],
})
export class UsersModule {}
