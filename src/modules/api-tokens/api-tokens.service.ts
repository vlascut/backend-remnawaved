import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { IApiTokenDeleteResponse, ICreateApiTokenRequest } from './interfaces';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { randomUUID } from 'crypto';
import { ApiTokenEntity } from './entities/api-token.entity';
import { ApiTokensRepository } from './repositories/api-tokens.repository';
import { Prisma } from '@prisma/client';
import { SignApiTokenCommand } from 'src/modules/auth/commands/sign-api-token/sign-api-token.command';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class ApiTokensService {
    private readonly logger = new Logger(ApiTokensService.name);
    constructor(
        private readonly configService: ConfigService,
        private readonly apiTokensRepository: ApiTokensRepository,
        private readonly commandBus: CommandBus,
    ) {}

    public async create(body: ICreateApiTokenRequest): Promise<ICommandResponse<ApiTokenEntity>> {
        const { tokenName, tokenDescription } = body;

        try {
            const uuid = randomUUID();

            const token = await this.signApiToken({
                uuid,
            });

            if (!token.isOk || !token.response) {
                return {
                    isOk: false,
                    ...ERRORS.CREATE_API_TOKEN_ERROR,
                };
            }

            const apiTokenEntity = new ApiTokenEntity({
                uuid,
                tokenName,
                tokenDescription,
                token: token.response,
            });

            const newAoiTokenEntity = await this.apiTokensRepository.create(apiTokenEntity);

            return {
                isOk: true,
                response: newAoiTokenEntity,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.CREATE_API_TOKEN_ERROR,
            };
        }
    }

    public async delete(uuid: string): Promise<ICommandResponse<IApiTokenDeleteResponse>> {
        try {
            const result = await this.apiTokensRepository.deleteByUUID(uuid);

            return {
                isOk: true,
                response: { result },
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return {
                        isOk: false,
                        ...ERRORS.REQUESTED_TOKEN_NOT_FOUND,
                    };
                }
            }
            return {
                isOk: false,
                ...ERRORS.DELETE_API_TOKEN_ERROR,
            };
        }
    }

    public async findAll(): Promise<ICommandResponse<ApiTokenEntity[]>> {
        try {
            const result = await this.apiTokensRepository.findByCriteria({});
            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.FIND_ALL_API_TOKENS_ERROR,
            };
        }
    }
    private async signApiToken(dto: SignApiTokenCommand): Promise<ICommandResponse<string>> {
        return this.commandBus.execute<SignApiTokenCommand, ICommandResponse<string>>(
            new SignApiTokenCommand(dto.uuid),
        );
    }
}
