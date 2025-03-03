import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueryBus } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';
import { ROLE } from '@libs/contracts/constants';

import { GetAdminByUsernameQuery } from '@modules/admin/queries/get-admin-by-username/get-admin-by-username.query';
import { AdminEntity } from '@modules/admin/entities/admin.entity';
import { IJWTAuthPayload } from '@modules/auth/interfaces';

@Injectable()
export class JwtDefaultGuard extends AuthGuard('registeredUserJWT') {
    constructor(private readonly queryBus: QueryBus) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isJwtValid = await super.canActivate(context);
        if (!isJwtValid) {
            return false;
        }

        const { user } = context.switchToHttp().getRequest<{ user: IJWTAuthPayload }>();

        if (!user || !user.username || !user.role) {
            return false;
        }

        if (user.role === ROLE.ADMIN) {
            const adminEntity = await this.getAdminByUsername({
                username: user.username,
                role: user.role,
            });

            if (!adminEntity.isOk || !adminEntity.response) {
                return false;
            }

            if (adminEntity.response.uuid !== user.uuid) {
                return false;
            }
        }

        return true;
    }

    private async getAdminByUsername(
        dto: GetAdminByUsernameQuery,
    ): Promise<ICommandResponse<AdminEntity>> {
        return this.queryBus.execute<GetAdminByUsernameQuery, ICommandResponse<AdminEntity>>(
            new GetAdminByUsernameQuery(dto.username, dto.role),
        );
    }
}
