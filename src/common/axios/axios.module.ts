import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AxiosService } from './axios.service';

@Global()
@Module({
    providers: [AxiosService],
    exports: [AxiosService],
    imports: [CqrsModule],
})
export class AxiosModule {}
