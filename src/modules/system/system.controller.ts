import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { SYSTEM_CONTROLLER, SYSTEM_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import {
    GetBandwidthStatsRequestQueryDto,
    GetBandwidthStatsResponseDto,
    GetNodesStatisticsResponseDto,
    GetStatsResponseDto,
} from './dtos';
import { SystemService } from './system.service';

@ApiBearerAuth('Authorization')
@ApiTags('System Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(SYSTEM_CONTROLLER)
export class SystemController {
    constructor(private readonly systemService: SystemService) {}

    @ApiOperation({ summary: 'Get System Stats' })
    @ApiResponse({
        status: 200,
        description: 'Returns system statistics',
        type: GetStatsResponseDto,
    })
    @Get(SYSTEM_ROUTES.STATS)
    async getStats(): Promise<GetStatsResponseDto> {
        const result = await this.systemService.getStats();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOperation({ summary: 'Get System Bandwidth Statistics' })
    @ApiResponse({
        status: 200,
        description: 'Returns bandwidth statistics',
        type: GetBandwidthStatsResponseDto,
    })
    @Get(SYSTEM_ROUTES.BANDWIDTH)
    async getBandwidthStats(
        @Query() query: GetBandwidthStatsRequestQueryDto,
    ): Promise<GetBandwidthStatsResponseDto> {
        const result = await this.systemService.getBandwidthStats(query);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOperation({ summary: 'Get Nodes Statistics' })
    @ApiResponse({
        status: 200,
        description: 'Returns nodes statistics',
        type: GetNodesStatisticsResponseDto,
    })
    @Get(SYSTEM_ROUTES.STATISTIC.NODES)
    async getNodesStatistics(): Promise<GetNodesStatisticsResponseDto> {
        const result = await this.systemService.getNodesStatistics();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
