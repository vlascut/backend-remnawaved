import { Controller, Get, HttpCode, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { KEYGEN_CONTROLLER } from '@libs/contracts/api';
import { Roles } from '@common/decorators/roles/roles';
import { KEYGEN_ROUTES } from '@libs/contracts/api';
import { RolesGuard } from '@common/guards/roles';
import { ROLE } from '@libs/contracts/constants';

import { KeygenService } from './keygen.service';
import { GetPubKeyResponseDto } from './dtos';
import { KeygenResponseModel } from './model';

@ApiTags('Keygen Controller')
@Controller(KEYGEN_CONTROLLER)
@Roles(ROLE.ADMIN, ROLE.API)
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtDefaultGuard, RolesGuard)
export class KeygenController {
    constructor(private readonly keygenService: KeygenService) {}

    @ApiOkResponse({
        type: [GetPubKeyResponseDto],
        description: 'Access token for further requests',
    })
    @ApiOperation({ summary: 'Get Public Key', description: 'Get public key' })
    @Get(KEYGEN_ROUTES.GET)
    @HttpCode(HttpStatus.OK)
    async generateKey(): Promise<GetPubKeyResponseDto> {
        const result = await this.keygenService.generateKey();

        const data = errorHandler(result);
        return {
            response: new KeygenResponseModel(data),
        };
    }

    // @Get('test')
    // async test(): Promise<any> {
    //     const result = await this.commandBus.execute(new GetNodeJwtCommand());

    //     const data = errorHandler(result);
    //     return data;
    // }
}
