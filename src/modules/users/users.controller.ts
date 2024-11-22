import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { errorHandler } from '@common/helpers/error-handler.helper';
import {
    CreateUserRequestDto,
    CreateUserResponseDto,
    DeleteUserRequestDto,
    DeleteUserResponseDto,
    DisableUserRequestDto,
    DisableUserResponseDto,
    EnableUserRequestDto,
    EnableUserResponseDto,
    GetAllUsersQueryDto,
    GetAllUsersResponseDto,
    GetUserByShortUuidRequestDto,
    GetUserByShortUuidResponseDto,
    GetUserBySubscriptionUuidRequestDto,
    GetUserBySubscriptionUuidResponseDto,
    GetUserByUuidRequestDto,
    GetUserByUuidResponseDto,
    RevokeUserSubscriptionRequestDto,
    RevokeUserSubscriptionResponseDto,
} from './dtos';
import { CreateUserResponseModel, GetUserResponseModel } from './models';
import {
    ApiBearerAuth,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { Roles } from '@common/decorators/roles/roles';
import { ROLE } from '@libs/contracts/constants';
import { USERS_CONTROLLER, USERS_ROUTES } from '@libs/contracts/api';

@ApiTags('Users Controller')
@ApiBearerAuth('Authorization')
@UseFilters(HttpExceptionFilter)
@Controller(USERS_CONTROLLER)
@UseGuards(JwtDefaultGuard, RolesGuard)
@Roles(ROLE.ADMIN, ROLE.API)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post(USERS_ROUTES.CREATE)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create User', description: 'Create a new user' })
    @ApiOkResponse({
        type: CreateUserResponseDto,
        description: 'User created successfully',
    })
    @ApiBody({ type: CreateUserRequestDto })
    async createUser(@Body() body: CreateUserRequestDto): Promise<CreateUserResponseDto> {
        const result = await this.usersService.createUser(body);

        const data = errorHandler(result);
        return {
            response: new CreateUserResponseModel(data),
        };
    }

    @Get(USERS_ROUTES.GET_ALL)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get All Users', description: 'Get all users' })
    @ApiOkResponse({
        type: GetAllUsersResponseDto,
        description: 'Users fetched successfully',
    })
    @ApiQuery({
        name: 'limit',
        type: Number,
        description: 'Limit of users, default is 10',
        required: false,
    })
    @ApiQuery({
        name: 'offset',
        type: Number,
        description: 'Offset of users, default is 0',
        required: false,
    })
    async getAllUsers(@Query() query: GetAllUsersQueryDto): Promise<GetAllUsersResponseDto> {
        const { limit, offset } = query;
        const result = await this.usersService.getAllUsers(limit, offset);

        const data = errorHandler(result);
        return {
            response: data.map((value) => new GetUserResponseModel(value)),
        };
    }

    @Get(USERS_ROUTES.GET_BY_SHORT_UUID)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get User By Short UUID', description: 'Get user by short UUID' })
    @ApiOkResponse({
        type: GetUserByShortUuidResponseDto,
        description: 'User fetched successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiParam({
        name: 'shortUuid',
        type: String,
        description: 'Short UUID of the user',
        required: true,
    })
    async getUserByShortUuid(
        @Param() paramData: GetUserByShortUuidRequestDto,
    ): Promise<GetUserByShortUuidResponseDto> {
        const result = await this.usersService.getUserByShortUuid(paramData.shortUuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(data),
        };
    }

    @Get(USERS_ROUTES.GET_BY_SUBSCRIPTION_UUID)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get User By Subscription UUID',
        description: 'Get user by subscription UUID',
    })
    @ApiOkResponse({
        type: GetUserBySubscriptionUuidResponseDto,
        description: 'User fetched successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiParam({
        name: 'subscriptionUuid',
        type: String,
        description: 'UUID of the subscription',
        required: true,
    })
    async getUserBySubscriptionUuid(
        @Param() paramData: GetUserBySubscriptionUuidRequestDto,
    ): Promise<GetUserBySubscriptionUuidResponseDto> {
        const result = await this.usersService.getUserBySubscriptionUuid(
            paramData.subscriptionUuid,
        );

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(data),
        };
    }

    @Get(USERS_ROUTES.GET_BY_UUID)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get User By UUID',
        description: 'Get user by UUID',
    })
    @ApiOkResponse({
        type: GetUserByUuidResponseDto,
        description: 'User fetched successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    async getUserByUuid(
        @Param() paramData: GetUserByUuidRequestDto,
    ): Promise<GetUserByUuidResponseDto> {
        const result = await this.usersService.getUserByUuid(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(data),
        };
    }

    @Patch(USERS_ROUTES.REVOKE_SUBSCRIPTION)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Revoke User Subscription',
        description: 'Revoke user subscription',
    })
    @ApiOkResponse({
        type: RevokeUserSubscriptionResponseDto,
        description: 'User subscription revoked successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    async revokeUserSubscription(
        @Param() paramData: RevokeUserSubscriptionRequestDto,
    ): Promise<RevokeUserSubscriptionResponseDto> {
        const result = await this.usersService.revokeUserSubscription(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(data),
        };
    }

    @Patch(USERS_ROUTES.DISABLE_USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Disable User',
        description: 'Disable user',
    })
    @ApiOkResponse({
        type: DisableUserResponseDto,
        description: 'User disabled successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    async disableUser(@Param() paramData: DisableUserRequestDto): Promise<DisableUserResponseDto> {
        const result = await this.usersService.disableUser(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(data),
        };
    }

    @Delete(USERS_ROUTES.DELETE_USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete User',
        description: 'Delete user',
    })
    @ApiOkResponse({
        type: DeleteUserResponseDto,
        description: 'User deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    async deleteUser(@Param() paramData: DeleteUserRequestDto): Promise<DeleteUserResponseDto> {
        const result = await this.usersService.deleteUser(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @Patch(USERS_ROUTES.ENABLE_USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Enable User',
        description: 'Enable user',
    })
    @ApiOkResponse({
        type: EnableUserResponseDto,
        description: 'User enabled successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    async enableUser(@Param() paramData: EnableUserRequestDto): Promise<EnableUserResponseDto> {
        const result = await this.usersService.enableUser(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(data),
        };
    }
}
