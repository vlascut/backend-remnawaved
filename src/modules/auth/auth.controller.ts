import { Controller, Post, UseFilters, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AUTH_CONTROLLER, AUTH_ROUTES } from '@libs/contracts/api/controllers/auth';
import { AuthService } from './auth.service';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { LoginRequestDto, LoginResponseDto } from './dtos';
import { AuthResponseModel } from './model/auth-response.model';
import { ApiOkResponse, ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth Controller')
@UseFilters(HttpExceptionFilter)
@Controller(AUTH_CONTROLLER)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post(AUTH_ROUTES.LOGIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login', description: 'Login to the system' })
    @ApiOkResponse({ type: [LoginResponseDto], description: 'Access token for further requests' })
    @ApiBody({ type: LoginRequestDto })
    async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
        const result = await this.authService.login(body);

        const data = errorHandler(result);
        return {
            response: new AuthResponseModel(data),
        };
    }
}
