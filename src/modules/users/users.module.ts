import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserConverter } from './users.converter';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { QUERIES } from './queries';

@Module({
    imports: [CqrsModule],
    controllers: [UsersController],
    providers: [UsersRepository, UserConverter, UsersService, ...QUERIES],
})
export class UsersModule {}
