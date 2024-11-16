import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApiTokensModule } from './api-tokens/api-tokens.module';
import { KeygenModule } from './keygen/keygen.module';

@Module({
    imports: [AuthModule, UsersModule, ApiTokensModule, KeygenModule],
})
export class RemnawaveModules {}
