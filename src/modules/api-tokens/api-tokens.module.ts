import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@common/database';
import { ApiTokenConverter } from './api-tokens.converter';
import { ApiTokensRepository } from './repositories/api-tokens.repository';
import { ApiTokensController } from './api-tokens.controllers';
import { ApiTokensService } from './api-tokens.service';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [ApiTokensController],
    providers: [ApiTokensRepository, ApiTokenConverter, ApiTokensService],
})
export class ApiTokensModule {}
