import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { SYSTEM_CONTROLLER, SYSTEM_ROUTES } from '@libs/contracts/api';
import { GetStatsRequestQueryDto, GetStatsResponseDto } from './dtos/get-stats.dto';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { Roles } from '@common/decorators/roles/roles';
import { ROLE } from '@libs/contracts/constants';
import { errorHandler } from '@common/helpers/error-handler.helper';
import {
    GetBandwidthStatsRequestQueryDto,
    GetBandwidthStatsResponseDto,
    GetNodesStatisticsRequestQueryDto,
    GetNodesStatisticsResponseDto,
} from './dtos';

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

    @Get(SYSTEM_ROUTES.BANDWIDTH)
    @ApiOperation({ summary: 'Get System Bandwidth Statistics' })
    @ApiResponse({
        status: 200,
        description: 'Returns bandwidth statistics',
        type: GetBandwidthStatsResponseDto,
    })
    async getBandwidthStats(
        @Query() query: GetBandwidthStatsRequestQueryDto,
    ): Promise<GetBandwidthStatsResponseDto> {
        const result = await this.systemService.getBandwidthStats(query);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @Get(SYSTEM_ROUTES.STATISTIC.NODES)
    @ApiOperation({ summary: 'Get Nodes Statistics' })
    @ApiResponse({
        status: 200,
        description: 'Returns nodes statistics',
        type: GetNodesStatisticsResponseDto,
    })
    async getNodesStatistics(): Promise<GetNodesStatisticsResponseDto> {
        const result = await this.systemService.getNodesStatistics();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
