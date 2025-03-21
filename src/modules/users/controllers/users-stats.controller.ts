import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Query,
    UseFilters,
    UseGuards,
} from '@nestjs/common';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { USERS_CONTROLLER, USERS_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import {
    GetUserUsageByRangeRequestDto,
    GetUserUsageByRangeRequestQueryDto,
    GetUserUsageByRangeResponseDto,
} from '../dtos';
import { GetUserUsageByRangeResponseModel } from '../models';
import { UsersService } from '../users.service';

@ApiBearerAuth('Authorization')
@ApiTags('Users Stats Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(USERS_CONTROLLER)
export class UsersStatsController {
    constructor(private readonly usersService: UsersService) {}

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserUsageByRangeResponseDto,
        description: 'User usage by range fetched successfully',
    })
    @ApiOperation({
        summary: 'Get User Usage By Range',
        description: 'Get user usage by range',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
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
    @Get(USERS_ROUTES.STATS.GET_USAGE_BY_RANGE + '/:uuid')
    async getUserUsageByRange(
        @Query() query: GetUserUsageByRangeRequestQueryDto,
        @Param() paramData: GetUserUsageByRangeRequestDto,
    ): Promise<GetUserUsageByRangeResponseDto> {
        const result = await this.usersService.getUserUsageByRange(
            paramData.uuid,
            new Date(query.start),
            new Date(query.end),
        );

        const data = errorHandler(result);
        return {
            response: data.map((item) => new GetUserUsageByRangeResponseModel(item)),
        };
    }
}
