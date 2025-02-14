import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Logger } from '@nestjs/common';
import { isDevelopment } from '@common/utils/startup-app/is-development';
@Injectable()
export class ProxyCheckGuard implements CanActivate {
    private readonly logger = new Logger(ProxyCheckGuard.name);

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        this.logger.log(request.headers); // dev only, remove before push to main

        const isProxy = Boolean(request.headers['x-forwarded-for']);

        this.logger.log(`Request is behind proxy: ${isProxy}`);

        if (!isProxy && !isDevelopment()) {
            const response = context.switchToHttp().getResponse();
            response.socket?.destroy();
        }

        return true;
    }
}
