import { Roles } from '@common/decorators/roles/roles';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { INBOUNDS_CONTROLLER, INBOUNDS_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';
import { Controller, Get, HttpCode, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetInboundsResponseDto } from './dtos';
import { InboundsService } from './inbounds.service';
import { GetInboundsResponseModel } from './models';

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
