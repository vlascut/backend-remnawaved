import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { KeygenRepository } from './repositories/keygen.repository';
import { KeygenController } from './keygen.cotroller';
import { KeygenService } from './keygen.service';
import { KeygenConverter } from './keygen.converter';
import { COMMANDS } from './commands';
import { getJWTConfig } from '@common/config/jwt/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [CqrsModule, JwtModule.registerAsync(getJWTConfig())],
    controllers: [KeygenController],
    providers: [KeygenRepository, KeygenService, KeygenConverter, ...COMMANDS],
})
export class KeygenModule {}
