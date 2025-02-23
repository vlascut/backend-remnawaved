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

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { USERS_CONTROLLER, USERS_ROUTES } from '@libs/contracts/api';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { ROLE } from '@libs/contracts/constants';

import {
    BulkDeleteUsersByStatusRequestDto,
    BulkDeleteUsersByStatusResponseDto,
    CreateUserRequestDto,
    CreateUserResponseDto,
    DeleteUserRequestDto,
    DeleteUserResponseDto,
    DisableUserRequestDto,
    DisableUserResponseDto,
    EnableUserRequestDto,
    EnableUserResponseDto,
    GetAllUsersV2QueryDto,
    GetAllUsersV2ResponseDto,
    GetUserByShortUuidRequestDto,
    GetUserByShortUuidResponseDto,
    GetUserBySubscriptionUuidRequestDto,
    GetUserBySubscriptionUuidResponseDto,
    GetUserByUsernameRequestDto,
    GetUserByUsernameResponseDto,
    GetUserByUuidRequestDto,
    GetUserByUuidResponseDto,
    ResetUserTrafficRequestDto,
    ResetUserTrafficResponseDto,
    RevokeUserSubscriptionRequestDto,
    RevokeUserSubscriptionResponseDto,
    UpdateUserRequestDto,
    UpdateUserResponseDto,
} from './dtos';
import {
    CreateUserResponseModel,
    GetAllUsersResponseModel,
    GetUserResponseModel,
    UserWithLifetimeTrafficResponseModel,
} from './models';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';

@ApiBearerAuth('Authorization')
@ApiTags('Users Controller')
@Controller(USERS_CONTROLLER)
@Roles(ROLE.ADMIN, ROLE.API)
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtDefaultGuard, RolesGuard)
export class UsersController {
    public readonly subPublicDomain: string;
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {
        this.subPublicDomain = this.configService.getOrThrow<string>('SUB_PUBLIC_DOMAIN');
    }

    @ApiBody({ type: CreateUserRequestDto })
    @ApiOkResponse({
        type: CreateUserResponseDto,
        description: 'User created successfully',
    })
    @ApiOperation({ summary: 'Create User', description: 'Create a new user' })
    @HttpCode(HttpStatus.CREATED)
    @Post(USERS_ROUTES.CREATE)
    async createUser(@Body() body: CreateUserRequestDto): Promise<CreateUserResponseDto> {
        const result = await this.usersService.createUser(body);

        const data = errorHandler(result);
        return {
            response: new CreateUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiBody({ type: UpdateUserRequestDto })
    @ApiOkResponse({
        type: UpdateUserResponseDto,
        description: 'User updated successfully',
    })
    @ApiOperation({ summary: 'Update User', description: 'Update a user' })
    @HttpCode(HttpStatus.CREATED)
    @Post(USERS_ROUTES.UPDATE)
    async updateUser(@Body() body: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
        const result = await this.usersService.updateUser(body);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiOkResponse({
        type: GetAllUsersV2ResponseDto,
        description: 'Users fetched successfully',
    })
    @ApiOperation({ summary: 'Get All Users', description: 'Get all users' })
    @ApiQuery({
        name: 'start',
        type: 'number',
        required: false,
        description: 'Offset for pagination',
    })
    @ApiQuery({
        name: 'size',
        type: 'number',
        required: false,
        description: 'Page size for pagination',
    })
    @Get(USERS_ROUTES.GET_ALL_V2)
    @HttpCode(HttpStatus.OK)
    async getAllUsersV2(@Query() query: GetAllUsersV2QueryDto): Promise<GetAllUsersV2ResponseDto> {
        const { start, size, filters, filterModes, globalFilterMode, sorting } = query;
        const result = await this.usersService.getAllUsersV2({
            start,
            size,
            filters,
            filterModes,
            globalFilterMode,
            sorting,
        });

        const data = errorHandler(result);
        return {
            response: new GetAllUsersResponseModel({
                total: data.total,
                users: data.users.map(
                    (item) => new UserWithLifetimeTrafficResponseModel(item, this.subPublicDomain),
                ),
            }),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByShortUuidResponseDto,
        description: 'User fetched successfully',
    })
    @ApiOperation({ summary: 'Get User By Short UUID', description: 'Get user by short UUID' })
    @ApiParam({
        name: 'shortUuid',
        type: String,
        description: 'Short UUID of the user',
        required: true,
    })
    @Get(USERS_ROUTES.GET_BY_SHORT_UUID + '/:shortUuid')
    @HttpCode(HttpStatus.OK)
    async getUserByShortUuid(
        @Param() paramData: GetUserByShortUuidRequestDto,
    ): Promise<GetUserByShortUuidResponseDto> {
        const result = await this.usersService.getUserByShortUuid(paramData.shortUuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByShortUuidResponseDto,
        description: 'User fetched successfully',
    })
    @ApiOperation({ summary: 'Get User By Username', description: 'Get user by username' })
    @ApiParam({
        name: 'username',
        type: String,
        description: 'Username of the user',
        required: true,
    })
    @Get(USERS_ROUTES.GET_BY_USERNAME + '/:username')
    @HttpCode(HttpStatus.OK)
    async getUserByUsername(
        @Param() paramData: GetUserByUsernameRequestDto,
    ): Promise<GetUserByUsernameResponseDto> {
        const result = await this.usersService.getUserByUsername(paramData.username);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserBySubscriptionUuidResponseDto,
        description: 'User fetched successfully',
    })
    @ApiOperation({
        summary: 'Get User By Subscription UUID',
        description: 'Get user by subscription UUID',
    })
    @ApiParam({
        name: 'subscriptionUuid',
        type: String,
        description: 'UUID of the subscription',
        required: true,
    })
    @Get(USERS_ROUTES.GET_BY_SUBSCRIPTION_UUID + '/:subscriptionUuid')
    @HttpCode(HttpStatus.OK)
    async getUserBySubscriptionUuid(
        @Param() paramData: GetUserBySubscriptionUuidRequestDto,
    ): Promise<GetUserBySubscriptionUuidResponseDto> {
        const result = await this.usersService.getUserBySubscriptionUuid(
            paramData.subscriptionUuid,
        );

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByUuidResponseDto,
        description: 'User fetched successfully',
    })
    @ApiOperation({
        summary: 'Get User By UUID',
        description: 'Get user by UUID',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    @Get(USERS_ROUTES.GET_BY_UUID + '/:uuid')
    @HttpCode(HttpStatus.OK)
    async getUserByUuid(
        @Param() paramData: GetUserByUuidRequestDto,
    ): Promise<GetUserByUuidResponseDto> {
        const result = await this.usersService.getUserByUuid(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: RevokeUserSubscriptionResponseDto,
        description: 'User subscription revoked successfully',
    })
    @ApiOperation({
        summary: 'Revoke User Subscription',
        description: 'Revoke user subscription',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    @HttpCode(HttpStatus.OK)
    @Patch(USERS_ROUTES.REVOKE_SUBSCRIPTION + '/:uuid')
    async revokeUserSubscription(
        @Param() paramData: RevokeUserSubscriptionRequestDto,
    ): Promise<RevokeUserSubscriptionResponseDto> {
        const result = await this.usersService.revokeUserSubscription(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: DisableUserResponseDto,
        description: 'User disabled successfully',
    })
    @ApiOperation({
        summary: 'Disable User',
        description: 'Disable user',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    @HttpCode(HttpStatus.OK)
    @Patch(USERS_ROUTES.DISABLE_USER + '/:uuid')
    async disableUser(@Param() paramData: DisableUserRequestDto): Promise<DisableUserResponseDto> {
        const result = await this.usersService.disableUser(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: DeleteUserResponseDto,
        description: 'User deleted successfully',
    })
    @ApiOperation({
        summary: 'Delete User',
        description: 'Delete user',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    @Delete(USERS_ROUTES.DELETE_USER + '/:uuid')
    @HttpCode(HttpStatus.OK)
    async deleteUser(@Param() paramData: DeleteUserRequestDto): Promise<DeleteUserResponseDto> {
        const result = await this.usersService.deleteUser(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: EnableUserResponseDto,
        description: 'User enabled successfully',
    })
    @ApiOperation({
        summary: 'Enable User',
        description: 'Enable user',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    @HttpCode(HttpStatus.OK)
    @Patch(USERS_ROUTES.ENABLE_USER + '/:uuid')
    async enableUser(@Param() paramData: EnableUserRequestDto): Promise<EnableUserResponseDto> {
        const result = await this.usersService.enableUser(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: ResetUserTrafficResponseDto,
        description: 'User traffic reset successfully',
    })
    @ApiOperation({
        summary: 'Reset User Traffic',
        description: 'Reset user traffic',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    @HttpCode(HttpStatus.OK)
    @Patch(USERS_ROUTES.RESET_USER_TRAFFIC + '/:uuid')
    async resetUserTraffic(
        @Param() paramData: ResetUserTrafficRequestDto,
    ): Promise<ResetUserTrafficResponseDto> {
        const result = await this.usersService.resetUserTraffic(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    @ApiBody({ type: BulkDeleteUsersByStatusRequestDto })
    @ApiOkResponse({
        type: BulkDeleteUsersByStatusResponseDto,
        description: 'Users deleted successfully',
    })
    @ApiOperation({
        summary: 'Bulk Delete Users By Status',
        description: 'Bulk delete users by status',
    })
    @HttpCode(HttpStatus.CREATED)
    @Post(USERS_ROUTES.BULK.DELETE_BY_STATUS)
    async bulkDeleteUsersByStatus(
        @Body() body: BulkDeleteUsersByStatusRequestDto,
    ): Promise<BulkDeleteUsersByStatusResponseDto> {
        const result = await this.usersService.bulkDeleteUsersByStatus(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
