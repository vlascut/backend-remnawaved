import {
    ApiBody,
    ApiForbiddenResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { AUTH_CONTROLLER, AUTH_ROUTES } from '@libs/contracts/api/controllers/auth';

import {
    GetStatusResponseDto,
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    RegisterResponseDto,
} from './dtos';
import { RegisterResponseModel } from './model/register.response.model';
import { AuthResponseModel } from './model/auth-response.model';
import { AuthService } from './auth.service';

@ApiTags('Auth Controller')
@UseFilters(HttpExceptionFilter)
@Controller(AUTH_CONTROLLER)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiBody({ type: LoginRequestDto })
    @ApiOperation({ summary: 'Login', description: 'Login to the system' })
    @ApiResponse({ type: LoginResponseDto, description: 'Access token for further requests' })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid credentials',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Invalid credentials' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    })
    @HttpCode(HttpStatus.OK)
    @Post(AUTH_ROUTES.LOGIN)
    async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
        const result = await this.authService.login(body);

        const data = errorHandler(result);
        return {
            response: new AuthResponseModel(data),
        };
    }

    @ApiBody({ type: RegisterRequestDto })
    @ApiForbiddenResponse({
        description: 'Forbidden - Registration is not allowed',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 403 },
                message: { type: 'string', example: 'Registration is not allowed' },
                error: { type: 'string', example: 'Forbidden' },
            },
        },
    })
    @ApiOperation({ summary: 'Register', description: 'Register to the system' })
    @ApiResponse({ type: RegisterResponseDto, description: 'Access token for further requests' })
    @HttpCode(HttpStatus.OK)
    @Post(AUTH_ROUTES.REGISTER)
    async register(@Body() body: RegisterRequestDto): Promise<RegisterResponseDto> {
        const result = await this.authService.register(body);

        const data = errorHandler(result);
        return {
            response: new RegisterResponseModel(data),
        };
    }

    @ApiOperation({ summary: 'Get status', description: 'Get status of the system' })
    @ApiResponse({ type: GetStatusResponseDto, description: 'Status of the system' })
    @HttpCode(HttpStatus.OK)
    @Get(AUTH_ROUTES.GET_STATUS)
    async getStatus(): Promise<GetStatusResponseDto> {
        const result = await this.authService.getStatus();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
