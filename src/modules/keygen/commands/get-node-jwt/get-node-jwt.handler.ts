import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IJWTAuthPayload } from 'src/modules/auth/interfaces';
import { ERRORS, ROLE } from '@libs/contracts/constants';
import { ICommandResponse } from '@common/types/command-response.type';
import { GetNodeJwtCommand } from './get-node-jwt.command';
import { KeygenService } from '../../keygen.service';
import * as jwt from 'jsonwebtoken';

@CommandHandler(GetNodeJwtCommand)
export class GetNodeJwtHandler
    implements ICommandHandler<GetNodeJwtCommand, ICommandResponse<string>>
{
    constructor(private readonly keygenService: KeygenService) {}

    async execute(): Promise<ICommandResponse<string>> {
        const response = await this.keygenService.generateKey();

        if (!response.isOk || !response.response) {
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }

        const { privKey } = response.response;

        const payload: IJWTAuthPayload = {
            uuid: null,
            username: null,
            role: ROLE.API,
        };

        const token = jwt.sign(payload, privKey, {
            algorithm: 'RS256',
            expiresIn: '9999d',
        });

        try {
            return {
                isOk: true,
                response: token,
            };
        } catch (error) {
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
