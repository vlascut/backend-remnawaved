import { Injectable, Logger } from '@nestjs/common';
import { generateKeyPair } from 'crypto';
import { promisify } from 'util';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants/errors';

import { KeygenRepository } from './repositories/keygen.repository';
import { KeygenEntity } from './entities/keygen.entity';

const generateKeyPairAsync = promisify(generateKeyPair);

@Injectable()
export class KeygenService {
    private readonly logger = new Logger(KeygenService.name);

    constructor(private readonly keygenRepository: KeygenRepository) {}

    public async generateKey(): Promise<ICommandResponse<KeygenEntity>> {
        try {
            const pubKey = await this.keygenRepository.findFirstByCriteria({});

            if (pubKey) {
                return {
                    isOk: true,
                    response: pubKey,
                };
            }

            const { privateKey, publicKey } = await generateKeyPairAsync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                },
            });

            const keygenEntity = new KeygenEntity({
                privKey: privateKey,
                pubKey: publicKey,
            });

            const newEntity = await this.keygenRepository.create(keygenEntity);

            return {
                isOk: true,
                response: newEntity,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.GET_PUBLIC_KEY_ERROR,
            };
        }
    }
}
