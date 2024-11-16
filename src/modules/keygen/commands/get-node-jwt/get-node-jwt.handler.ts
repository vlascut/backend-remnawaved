import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { IJWTAuthPayload } from 'src/modules/auth/interfaces';
import { ERRORS, ROLE } from '@libs/contracts/constants';
import { ICommandResponse } from '@common/types/command-response.type';
import { GetNodeJwtCommand } from './get-node-jwt.command';
import { KeygenService } from '../../keygen.service';
import * as jwt from 'jsonwebtoken';
import { log } from 'console';
import * as fs from 'fs';
@CommandHandler(GetNodeJwtCommand)
export class GetNodeJwtHandler
    implements ICommandHandler<GetNodeJwtCommand, ICommandResponse<string>>
{
    constructor(
        private readonly jwtService: JwtService,
        private readonly keygenService: KeygenService,
    ) {}

    async execute(): Promise<ICommandResponse<string>> {
        const response = await this.keygenService.generateKey();

        if (!response.isOk || !response.response) {
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }

        const { privKey, pubKey } = response.response;

        const payload: IJWTAuthPayload = {
            uuid: null,
            username: null,
            role: ROLE.API,
        };

        const token = jwt.sign(payload, privKey, {
            algorithm: 'RS256',
            expiresIn: '9999d',
        });

        // const token = await this.jwtService.signAsync(payload, {
        //     algorithm: 'RS256',
        //     expiresIn: '1d',
        //     issuer: 'node',
        //     subject: 'node',
        //     audience: 'node',
        //     // privateKey: {
        //     //     key: Buffer.from(privKey),
        //     //     passphrase: '',
        //     // },
        // });

        const validate = jwt.verify(token, pubKey, {
            algorithms: ['RS256'],
        });

        log(validate);

        // // const checkPassopt = await this.jwtService.verifyAsync(token, {
        // //     algorithms: ['RS256'],
        // //     publicKey: fs.readFileSync(
        // //         '/Users/alanwake/Code/envoy/envoy-backend/src/modules/keygen/commands/get-node-jwt/pubkey.pem',
        // //     ),
        // // });

        // log(checkPassopt);

        try {
            return {
                isOk: true,
                response: token,
            };
        } catch (error) {
            console.error('JWT signing error:', error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
