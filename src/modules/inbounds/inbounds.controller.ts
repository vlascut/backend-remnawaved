import { Controller, Get, HttpCode, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { INBOUNDS_CONTROLLER, INBOUNDS_ROUTES } from '@libs/contracts/api';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { ROLE } from '@libs/contracts/constants';

import { InboundsService } from './inbounds.service';
import { GetInboundsResponseModel } from './models';
import { GetInboundsResponseDto } from './dtos';

@ApiBearerAuth('Authorization')
@ApiTags('Inbounds Controller')
@Controller(INBOUNDS_CONTROLLER)
@Roles(ROLE.ADMIN, ROLE.API)
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtDefaultGuard, RolesGuard)
export class InboundsController {
    constructor(private readonly inboundsService: InboundsService) {}

    @ApiOkResponse({
        type: [GetInboundsResponseDto],
        description: 'Get inbounds',
    })
    @ApiOperation({ summary: 'Get Inbounds', description: 'Get inbounds' })
    @Get(INBOUNDS_ROUTES.GET_INBOUNDS)
    @HttpCode(HttpStatus.OK)
    async getInbounds(): Promise<GetInboundsResponseDto> {
        const result = await this.inboundsService.getInbounds();

        const data = errorHandler(result);
        return {
            response: data.map((value) => new GetInboundsResponseModel(value)),
        };
    }
}
