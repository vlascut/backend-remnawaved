import { generateKeyPair } from 'crypto';
import { promisify } from 'util';

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants/errors';

import { KeygenRepository } from './repositories/keygen.repository';
import { KeygenEntity } from './entities/keygen.entity';

const generateKeyPairAsync = promisify(generateKeyPair);

@Injectable()
export class KeygenService implements OnApplicationBootstrap {
    private readonly logger = new Logger(KeygenService.name);

    constructor(private readonly keygenRepository: KeygenRepository) {}

    async onApplicationBootstrap() {
        const pubKey = await this.keygenRepository.findFirstByCriteria({});

        if (pubKey) {
            this.logger.log('Keypair already exists, skipping...');
            return;
        }

        const result = await this.generateKey();

        if (!result.isOk) {
            this.logger.error('Failed to generate keypair, please restart application.');
            return;
        }

        this.logger.log('Keypair generated successfully.');

        return;
    }

    public async generateKey(): Promise<ICommandResponse<KeygenEntity>> {
        try {
            const pubKey = await this.keygenRepository.findFirstByCriteria({});

            if (pubKey) {
                return {
                    isOk: true,
                    response: pubKey,
                };
            }

            const newEntity = await this.createKeypair();

            if (!newEntity) {
                return {
                    isOk: false,
                    ...ERRORS.KEYPAIR_CREATION_ERROR,
                };
            }

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

    private async createKeypair(): Promise<KeygenEntity | null> {
        try {
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

            return newEntity;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }
}
