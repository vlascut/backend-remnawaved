import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [CqrsModule],
    controllers: [SystemController],
    providers: [SystemService],
})
export class SystemModule {}
