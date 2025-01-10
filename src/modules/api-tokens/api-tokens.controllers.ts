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
import { API_TOKENS_ROUTES } from '@libs/contracts/api/controllers';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { API_TOKENS_CONTROLLER } from '@libs/contracts/api';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
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
@Controller(API_TOKENS_CONTROLLER)
@Roles(ROLE.ADMIN)
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtDefaultGuard, RolesGuard)
export class ApiTokensController {
    constructor(private readonly apiTokensService: ApiTokensService) {}

    @ApiBody({ type: CreateApiTokenRequestDto })
    @ApiOperation({ summary: 'Create new API token' })
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

    @ApiOperation({ summary: 'Delete API token' })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the API token' })
    @ApiResponse({ status: 200, description: 'Token deleted successfully' })
    @Delete(`${API_TOKENS_ROUTES.DELETE}/:uuid`)
    @HttpCode(HttpStatus.OK)
    async delete(@Param() paramData: DeleteApiTokenRequestDto): Promise<DeleteApiTokenResponseDto> {
        const result = await this.apiTokensService.delete(paramData.uuid);
        const data = errorHandler(result);
        return {
            response: data.result,
        };
    }

    @ApiOperation({ summary: 'Get all API tokens' })
    @ApiResponse({ status: 200, description: 'Tokens fetched successfully' })
    @Get(API_TOKENS_ROUTES.GET_ALL)
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<FindAllApiTokensResponseDto> {
        const result = await this.apiTokensService.findAll();
        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
