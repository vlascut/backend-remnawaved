import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SignApiTokenCommand } from './sign-api-token.command';
import { IJWTAuthPayload } from 'src/modules/auth/interfaces';
import { ROLE } from '@libs/contracts/constants';
import { ICommandResponse } from '@common/types/command-response.type';

@CommandHandler(SignApiTokenCommand)
export class SignApiTokenHandler
    implements ICommandHandler<SignApiTokenCommand, ICommandResponse<string>>
{
    constructor(private readonly jwtService: JwtService) {}

    async execute(command: SignApiTokenCommand): Promise<ICommandResponse<string>> {
        const payload: IJWTAuthPayload = {
            uuid: command.uuid,
            username: null,
            role: ROLE.API,
        };

        return {
            isOk: true,
            response: this.jwtService.sign(payload, {
                expiresIn: '99999d',
            }),
        };
    }
}
