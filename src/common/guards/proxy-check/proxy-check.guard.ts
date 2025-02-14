import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Logger } from '@nestjs/common';
import { isDevelopment } from '@common/utils/startup-app/is-development';
@Injectable()
export class ProxyCheckGuard implements CanActivate {
    private readonly logger = new Logger(ProxyCheckGuard.name);

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const isProxy = Boolean(request.headers['x-forwarded-for']);
        const isHttps = Boolean(request.headers['x-forwarded-proto'] === 'https');

        this.logger.debug(
            `X-Forwarded-For: ${request.headers['x-forwarded-for']}, X-Forwarded-Proto: ${request.headers['x-forwarded-proto']}`,
        );

        if ((!isHttps || !isProxy) && isDevelopment()) {
            const response = context.switchToHttp().getResponse();
            response.socket?.destroy();

            this.logger.error('Reverse proxy and HTTPS are required.');
        }

        return true;
    }
}
