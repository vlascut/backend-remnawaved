import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { JOBS_SERVICES } from './tasks';

@Module({
    imports: [CqrsModule],
    providers: [...JOBS_SERVICES],
})
export class JobsModule {}
