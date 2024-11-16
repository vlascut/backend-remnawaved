import {
    Controller,
    Post,
    Delete,
    Get,
    UseGuards,
    Body,
    Param,
    UseFilters,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';

import { ApiTokensService } from './api-tokens.service';

import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { API_TOKENS_ROUTES } from '@libs/contracts/api/controllers';
import { API_TOKENS_CONTROLLER } from '@libs/contracts/api';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import {
    CreateApiTokenRequestDto,
    CreateApiTokenResponseDto,
    DeleteApiTokenRequestDto,
    DeleteApiTokenResponseDto,
    FindAllApiTokensResponseDto,
} from './dtos';
import { CreateApiTokenResponseModel, FindAllApiTokensResponseModel } from './models';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { RolesGuard } from '@common/guards/roles';
import { Roles } from '@common/decorators/roles/roles';
import { ROLE } from '@libs/contracts/constants';

@ApiTags('API Tokens Management')
@ApiBearerAuth('Authorization')
@Controller(API_TOKENS_CONTROLLER)
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtDefaultGuard, RolesGuard)
@Roles(ROLE.ADMIN)
export class ApiTokensController {
    constructor(private readonly apiTokensService: ApiTokensService) {}

    @Post(API_TOKENS_ROUTES.CREATE)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new API token' })
    @ApiResponse({ status: 201, description: 'Token created successfully' })
    @ApiBody({ type: CreateApiTokenRequestDto })
    async create(@Body() body: CreateApiTokenRequestDto): Promise<CreateApiTokenResponseDto> {
        const result = await this.apiTokensService.create(body);

        const data = errorHandler(result);
        return {
            response: new CreateApiTokenResponseModel(data),
        };
    }

    @Delete(`${API_TOKENS_ROUTES.DELETE}/:uuid`)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete API token' })
    @ApiResponse({ status: 200, description: 'Token deleted successfully' })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the API token' })
    async delete(@Param() paramData: DeleteApiTokenRequestDto): Promise<DeleteApiTokenResponseDto> {
        const result = await this.apiTokensService.delete(paramData.uuid);
        const data = errorHandler(result);
        return {
            response: data.result,
        };
    }

    @Get(API_TOKENS_ROUTES.GET_ALL)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all API tokens' })
    @ApiResponse({ status: 200, description: 'Tokens fetched successfully' })
    async findAll(): Promise<FindAllApiTokensResponseDto> {
        const result = await this.apiTokensService.findAll();
        const data = errorHandler(result);
        return {
            response: data.map((item) => new FindAllApiTokensResponseModel(item)),
        };
    }
}
