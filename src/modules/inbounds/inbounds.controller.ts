import { Controller, Get, UseFilters, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { INBOUNDS_CONTROLLER, INBOUNDS_ROUTES } from '@libs/contracts/api';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { errorHandler } from '@common/helpers/error-handler.helper';

import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetInboundsResponseDto } from './dtos';
import { RolesGuard } from '@common/guards/roles';
import { ROLE } from '@libs/contracts/constants';
import { Roles } from '@common/decorators/roles/roles';

import { InboundsService } from './inbounds.service';
import { GetInboundsResponseModel } from './models';
import { JwtDefaultGuard } from '../../common/guards/jwt-guards/def-jwt-guard';

@ApiTags('Inbounds Controller')
@ApiBearerAuth('Authorization')
@UseFilters(HttpExceptionFilter)
@Controller(INBOUNDS_CONTROLLER)
@UseGuards(JwtDefaultGuard, RolesGuard)
@Roles(ROLE.ADMIN, ROLE.API)
export class InboundsController {
    constructor(private readonly inboundsService: InboundsService) {}

    @Get(INBOUNDS_ROUTES.GET_INBOUNDS)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Inbounds', description: 'Get inbounds' })
    @ApiOkResponse({
        type: [GetInboundsResponseDto],
        description: 'Get inbounds',
    })
    async getInbounds(): Promise<GetInboundsResponseDto> {
        const result = await this.inboundsService.getInbounds();

        const data = errorHandler(result);
        return {
            response: data.map((value) => new GetInboundsResponseModel(value)),
        };
    }
}
