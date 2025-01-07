import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException();
        }

        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];

        const configUser = this.configService.getOrThrow<string>('METRICS_USER');
        const configPass = this.configService.getOrThrow<string>('METRICS_PASS');

        if (user === configUser && pass === configPass) {
            return true;
        }

        throw new UnauthorizedException();
    }
}
