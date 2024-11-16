import { Controller, Get, UseFilters, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { KEYGEN_ROUTES } from '@libs/contracts/api';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { errorHandler } from '@common/helpers/error-handler.helper';

import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KEYGEN_CONTROLLER } from '@libs/contracts/api';

import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { ROLE } from '@libs/contracts/constants';
import { Roles } from '@common/decorators/roles/roles';
import { GetPubKeyResponseDto } from './dtos';
import { KeygenService } from './keygen.service';
import { KeygenResponseModel } from './model';
import { GetNodeJwtCommand } from './commands/get-node-jwt';
import { CommandBus } from '@nestjs/cqrs';

@ApiTags('Keygen Controller')
@UseFilters(HttpExceptionFilter)
@Controller(KEYGEN_CONTROLLER)
// @UseGuards(JwtDefaultGuard, RolesGuard)
export class KeygenController {
    constructor(
        private readonly keygenService: KeygenService,
        private readonly commandBus: CommandBus,
    ) {}

    @Get(KEYGEN_ROUTES.GET)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Public Key', description: 'Get public key' })
    @ApiOkResponse({
        type: [GetPubKeyResponseDto],
        description: 'Access token for further requests',
    })
    @Roles(ROLE.ADMIN)
    async generateKey(): Promise<GetPubKeyResponseDto> {
        const result = await this.keygenService.generateKey();

        const data = errorHandler(result);
        return {
            response: new KeygenResponseModel(data),
        };
    }

    @Get('test')
    async test(): Promise<any> {
        const result = await this.commandBus.execute(new GetNodeJwtCommand());

        const data = errorHandler(result);
        return data;
    }
}
