import { Controller, Get, HttpCode, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { KEYGEN_CONTROLLER } from '@libs/contracts/api';
import { KEYGEN_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import { KeygenService } from './keygen.service';
import { GetPubKeyResponseDto } from './dtos';
import { KeygenResponseModel } from './model';

@ApiBearerAuth('Authorization')
@ApiTags('Keygen Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(KEYGEN_CONTROLLER)
export class KeygenController {
    constructor(private readonly keygenService: KeygenService) {}

    @ApiOkResponse({
        type: GetPubKeyResponseDto,
        description: 'Get SSL_CERT for Remnawave Node',
    })
    @ApiOperation({ summary: 'Get SSL_CERT', description: 'Get SSL_CERT for Remnawave Node' })
    @HttpCode(HttpStatus.OK)
    @Get(KEYGEN_ROUTES.GET)
    async generateKey(): Promise<GetPubKeyResponseDto> {
        const result = await this.keygenService.generateKey();

        const data = errorHandler(result);
        return {
            response: new KeygenResponseModel(data.payload),
        };
    }
}
