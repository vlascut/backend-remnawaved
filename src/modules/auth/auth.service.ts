import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants/errors';
import { ROLE } from '@libs/contracts/constants';

import { ILogin } from './interfaces';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    public async login(dto: ILogin): Promise<ICommandResponse<any>> {
        try {
            const { username, password } = dto;

            const adminUsername = this.configService.get('SUPERADMIN_USERNAME');
            const adminPassword = this.configService.get('SUPERADMIN_PASSWORD');

            const hashedPassword = createHash('md5').update(adminPassword).digest('hex');

            if (username !== adminUsername || hashedPassword !== password) {
                return {
                    isOk: false,
                    ...ERRORS.UNAUTHORIZED,
                };
            }

            const accessToken = this.jwtService.sign({
                username,
                uuid: null,
                role: ROLE.ADMIN,
            });

            return {
                isOk: true,
                response: { accessToken },
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.LOGIN_ERROR,
            };
        }
    }
}
