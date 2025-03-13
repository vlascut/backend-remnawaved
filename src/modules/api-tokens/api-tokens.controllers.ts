import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { API_TOKENS_ROUTES } from '@libs/contracts/api/controllers';
import { API_TOKENS_CONTROLLER } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import {
    CreateApiTokenRequestDto,
    CreateApiTokenResponseDto,
    DeleteApiTokenRequestDto,
    DeleteApiTokenResponseDto,
    FindAllApiTokensResponseDto,
} from './dtos';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenResponseModel } from './models';

@ApiBearerAuth('Authorization')
@ApiTags('API Tokens Management')
@Roles(ROLE.ADMIN)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(API_TOKENS_CONTROLLER)
export class ApiTokensController {
    constructor(private readonly apiTokensService: ApiTokensService) {}

    @ApiBody({ type: CreateApiTokenRequestDto })
    @ApiOperation({
        summary: 'Create new API token',
        description:
            'This endpoint is forbidden to use via "API-key". It can be used only admin JWT-token.',
    })
    @ApiResponse({ status: 201, description: 'Token created successfully' })
    @HttpCode(HttpStatus.CREATED)
    @Post(API_TOKENS_ROUTES.CREATE)
    async create(@Body() body: CreateApiTokenRequestDto): Promise<CreateApiTokenResponseDto> {
        const result = await this.apiTokensService.create(body);

        const data = errorHandler(result);
        return {
            response: new CreateApiTokenResponseModel(data),
        };
    }

    @ApiOperation({
        summary: 'Delete API token',
        description:
            'This endpoint is forbidden to use via "API-key". It can be used only admin JWT-token.',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the API token' })
    @ApiResponse({ status: 200, description: 'Token deleted successfully' })
    @HttpCode(HttpStatus.OK)
    @Delete(`${API_TOKENS_ROUTES.DELETE}/:uuid`)
    async delete(@Param() paramData: DeleteApiTokenRequestDto): Promise<DeleteApiTokenResponseDto> {
        const result = await this.apiTokensService.delete(paramData.uuid);
        const data = errorHandler(result);
        return {
            response: data.result,
        };
    }

    @ApiOperation({
        summary: 'Get all API tokens',
        description:
            'This endpoint is forbidden to use via "API-key". It can be used only admin JWT-token.',
    })
    @ApiResponse({ status: 200, description: 'Tokens fetched successfully' })
    @HttpCode(HttpStatus.OK)
    @Get(API_TOKENS_ROUTES.GET_ALL)
    async findAll(): Promise<FindAllApiTokensResponseDto> {
        const result = await this.apiTokensService.findAll();
        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
