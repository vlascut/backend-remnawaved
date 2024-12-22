import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UserConverter } from './users.converter';
import { UsersService } from './users.service';
import { COMMANDS } from './commands';
import { QUERIES } from './queries';
@Module({
    imports: [CqrsModule],
    controllers: [UsersController],
    providers: [UsersRepository, UserConverter, UsersService, ...QUERIES, ...COMMANDS],
})
export class UsersModule {}
