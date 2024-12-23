import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { NODES_CONTROLLER, NODES_ROUTES } from '@libs/contracts/api';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { ROLE } from '@libs/contracts/constants';

import { GetNodesUsageByRangeRequestQueryDto, GetNodesUsageByRangeResponseDto } from './dtos';
import { NodesUsageHistoryService } from './nodes-usage-history.service';

@ApiBearerAuth('Authorization')
@ApiTags('Bandwidth stats')
@Controller(NODES_CONTROLLER)
@Roles(ROLE.ADMIN, ROLE.API)
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtDefaultGuard, RolesGuard)
export class NodesUsageHistoryController {
    constructor(private readonly nodesUsageHistoryService: NodesUsageHistoryService) {}

    @ApiOkResponse({
        type: GetNodesUsageByRangeResponseDto,
        description: 'Nodes usage by range fetched successfully',
    })
    @ApiOperation({ summary: 'Get Nodes Usage By Range', description: 'Get nodes usage by range' })
    @ApiQuery({
        name: 'end',
        type: Date,
        description: 'End date',
        required: true,
    })
    @ApiQuery({
        name: 'start',
        type: Date,
        description: 'Start date',
        required: true,
    })
    @Get(NODES_ROUTES.STATS.USAGE_BY_RANGE)
    @HttpCode(HttpStatus.OK)
    async getNodesUsageByRange(
        @Query() query: GetNodesUsageByRangeRequestQueryDto,
    ): Promise<GetNodesUsageByRangeResponseDto> {
        const { start, end } = query;
        const result = await this.nodesUsageHistoryService.getNodesUsageByRange(start, end);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
