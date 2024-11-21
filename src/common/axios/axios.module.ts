import { Global, Module } from '@nestjs/common';
import { AxiosService } from './axios.service';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
    providers: [AxiosService],
    exports: [AxiosService],
    imports: [CqrsModule],
})
export class AxiosModule {}
