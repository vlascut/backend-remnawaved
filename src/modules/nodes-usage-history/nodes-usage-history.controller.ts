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
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { NODES_CONTROLLER, NODES_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import { GetNodesUsageByRangeRequestQueryDto, GetNodesUsageByRangeResponseDto } from './dtos';
import { NodesUsageHistoryService } from './nodes-usage-history.service';

@ApiBearerAuth('Authorization')
@ApiTags('Bandwidth stats')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(NODES_CONTROLLER)
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
    @HttpCode(HttpStatus.OK)
    @Get(NODES_ROUTES.STATS.USAGE_BY_RANGE)
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
