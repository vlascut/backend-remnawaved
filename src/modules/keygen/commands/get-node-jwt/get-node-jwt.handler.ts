import * as jwt from 'jsonwebtoken';

import { IJWTAuthPayload } from 'src/modules/auth/interfaces';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS, ROLE } from '@libs/contracts/constants';

import { GetNodeJwtCommand } from './get-node-jwt.command';
import { KeygenService } from '../../keygen.service';

@CommandHandler(GetNodeJwtCommand)
export class GetNodeJwtHandler
    implements ICommandHandler<GetNodeJwtCommand, ICommandResponse<string>>
{
    private readonly logger = new Logger(GetNodeJwtHandler.name);

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

        // TODO: remove this after testing
        this.logger.log(`Node JWT: ${token}, signed with private key: \n ${privKey}`);

        try {
            return {
                isOk: true,
                response: token,
            };
        } catch (error) {
            this.logger.error(`Error getting node jwt: ${error}`);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
