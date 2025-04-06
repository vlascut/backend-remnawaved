import { Controller, Get, HttpCode, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { INBOUNDS_CONTROLLER, INBOUNDS_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import { GetFullInboundsResponseDto, GetInboundsResponseDto } from '../dtos';
import { GetBaseInboundsResponseModel } from '../models';
import { InboundsService } from '../inbounds.service';

@ApiBearerAuth('Authorization')
@ApiTags('Inbounds Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(INBOUNDS_CONTROLLER)
export class InboundsController {
    constructor(private readonly inboundsService: InboundsService) {}

    @ApiOkResponse({
        type: [GetInboundsResponseDto],
        description: 'Get inbounds',
    })
    @ApiOperation({ summary: 'Get Inbounds', description: 'Get inbounds' })
    @HttpCode(HttpStatus.OK)
    @Get(INBOUNDS_ROUTES.GET_INBOUNDS)
    async getInbounds(): Promise<GetInboundsResponseDto> {
        const result = await this.inboundsService.getInbounds();

        const data = errorHandler(result);
        return {
            response: data.map((value) => new GetBaseInboundsResponseModel(value)),
        };
    }

    @ApiOkResponse({
        type: [GetFullInboundsResponseDto],
        description: 'Get full inbounds',
    })
    @ApiOperation({ summary: 'Get Full Inbounds', description: 'Get full inbounds' })
    @HttpCode(HttpStatus.OK)
    @Get(INBOUNDS_ROUTES.GET_FULL_INBOUNDS)
    async getFullInbounds(): Promise<GetFullInboundsResponseDto> {
        const result = await this.inboundsService.getFullInbounds();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
