import { Controller, Get, HttpCode, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { INBOUNDS_CONTROLLER, INBOUNDS_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import { InboundsService } from './inbounds.service';
import { GetInboundsResponseModel } from './models';
import { GetInboundsResponseDto } from './dtos';

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
            response: data.map((value) => new GetInboundsResponseModel(value)),
        };
    }
}
