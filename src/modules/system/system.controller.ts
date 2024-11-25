import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { SYSTEM_CONTROLLER, SYSTEM_ROUTES } from '@libs/contracts/api';
import { GetStatsResponseDto } from './dtos/get-stats.dto';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { Roles } from '@common/decorators/roles/roles';
import { ROLE } from '@libs/contracts/constants';
import { errorHandler } from '@common/helpers/error-handler.helper';

@ApiTags('System Controller')
@UseFilters(HttpExceptionFilter)
@Controller(SYSTEM_CONTROLLER)
@ApiBearerAuth('Authorization')
@UseGuards(JwtDefaultGuard, RolesGuard)
@Roles(ROLE.ADMIN, ROLE.API)
export class SystemController {
    constructor(private readonly systemService: SystemService) {}

    @Get(SYSTEM_ROUTES.STATS)
    @ApiOperation({ summary: 'Get System Stats' })
    @ApiResponse({
        status: 200,
        description: 'Returns system statistics',
        type: GetStatsResponseDto,
    })
    async getStats(): Promise<GetStatsResponseDto> {
        const result = await this.systemService.getStats();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
