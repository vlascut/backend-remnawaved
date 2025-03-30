import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
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
import { ConfigService } from '@nestjs/config';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { USERS_CONTROLLER, USERS_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import {
    ActivateAllInboundsRequestDto,
    ActivateAllInboundsResponseDto,
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
} from '../dtos';
import {
    CreateUserResponseModel,
    GetAllUsersResponseModel,
    GetFullUserResponseModel,
    GetUserResponseModel,
    UserWithLifetimeTrafficResponseModel,
} from '../models';
import {
    GetUserByTelegramIdRequestDto,
    GetUserByTelegramIdResponseDto,
} from '../dtos/get-user-by-telegram-id.dto';
import { GetUserByEmailResponseDto } from '../dtos/get-user-by-email.dto';
import { GetUserByEmailRequestDto } from '../dtos/get-user-by-email.dto';
import { UsersService } from '../users.service';

@ApiBearerAuth('Authorization')
@ApiTags('Users Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(USERS_CONTROLLER)
export class UsersController {
    public readonly subPublicDomain: string;
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {
        this.subPublicDomain = this.configService.getOrThrow<string>('SUB_PUBLIC_DOMAIN');
    }

    @ApiBody({ type: CreateUserRequestDto })
    @ApiCreatedResponse({
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
    @HttpCode(HttpStatus.OK)
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
    @HttpCode(HttpStatus.OK)
    @Get(USERS_ROUTES.GET_ALL_V2)
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
    @HttpCode(HttpStatus.OK)
    @Delete(USERS_ROUTES.DELETE_USER + '/:uuid')
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

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: ActivateAllInboundsResponseDto,
        description: 'All inbounds activated successfully',
    })
    @ApiOperation({
        summary: 'Activate All Inbounds',
        description: 'Activate all inbounds',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the user', required: true })
    @HttpCode(HttpStatus.OK)
    @Patch(USERS_ROUTES.ACTIVATE_ALL_INBOUNDS + '/:uuid')
    async activateAllInbounds(
        @Param() paramData: ActivateAllInboundsRequestDto,
    ): Promise<ActivateAllInboundsResponseDto> {
        const result = await this.usersService.activateAllInbounds(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetUserResponseModel(
                data.user,
                data.lastConnectedNode,
                this.subPublicDomain,
            ),
        };
    }

    /* get by methods




    */

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
    @HttpCode(HttpStatus.OK)
    @Get(USERS_ROUTES.GET_BY_SHORT_UUID + '/:shortUuid')
    async getUserByShortUuid(
        @Param() paramData: GetUserByShortUuidRequestDto,
    ): Promise<GetUserByShortUuidResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({
            shortUuid: paramData.shortUuid,
        });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
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
    @HttpCode(HttpStatus.OK)
    @Get(USERS_ROUTES.GET_BY_SUBSCRIPTION_UUID + '/:subscriptionUuid')
    async getUserBySubscriptionUuid(
        @Param() paramData: GetUserBySubscriptionUuidRequestDto,
    ): Promise<GetUserBySubscriptionUuidResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({
            subscriptionUuid: paramData.subscriptionUuid,
        });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
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
    @HttpCode(HttpStatus.OK)
    @Get(USERS_ROUTES.GET_BY_UUID + '/:uuid')
    async getUserByUuid(
        @Param() paramData: GetUserByUuidRequestDto,
    ): Promise<GetUserByUuidResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({ uuid: paramData.uuid });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiOkResponse({
        type: GetUserByUsernameResponseDto,
        description: 'User fetched successfully',
    })
    @ApiOperation({ summary: 'Get User By Username', description: 'Get user by username' })
    @ApiParam({
        name: 'username',
        type: String,
        description: 'Username of the user',
        required: true,
    })
    @HttpCode(HttpStatus.OK)
    @Get(USERS_ROUTES.GET_BY_USERNAME + '/:username')
    async getUserByUsername(
        @Param() paramData: GetUserByUsernameRequestDto,
    ): Promise<GetUserByUsernameResponseDto> {
        const result = await this.usersService.getUserByUniqueFields({
            username: paramData.username,
        });

        const data = errorHandler(result);
        return {
            response: new GetFullUserResponseModel(data, this.subPublicDomain),
        };
    }

    @ApiNotFoundResponse({
        description: 'Users not found',
    })
    @ApiOkResponse({
        type: GetUserByTelegramIdResponseDto,
        description: 'Users fetched successfully',
    })
    @ApiOperation({ summary: 'Get Users By Telegram ID', description: 'Get users by telegram ID' })
    @ApiParam({
        name: 'telegramId',
        type: String,
        description: 'Telegram ID of the user',
        required: true,
    })
    @HttpCode(HttpStatus.OK)
    @Get(USERS_ROUTES.GET_BY_TELEGRAM_ID + '/:telegramId')
    async getUserByTelegramId(
        @Param() paramData: GetUserByTelegramIdRequestDto,
    ): Promise<GetUserByTelegramIdResponseDto> {
        const result = await this.usersService.getUsersByTelegramIdOrEmail({
            telegramId: paramData.telegramId,
        });

        const data = errorHandler(result);
        return {
            response: data.map((item) => new GetFullUserResponseModel(item, this.subPublicDomain)),
        };
    }

    @ApiNotFoundResponse({
        description: 'Users not found',
    })
    @ApiOkResponse({
        type: GetUserByEmailResponseDto,
        description: 'Users fetched successfully',
    })
    @ApiOperation({ summary: 'Get Users By Email', description: 'Get users by email' })
    @ApiParam({
        name: 'email',
        type: String,
        description: 'Email of the user',
        required: true,
    })
    @HttpCode(HttpStatus.OK)
    @Get(USERS_ROUTES.GET_BY_EMAIL + '/:email')
    async getUsersByEmail(
        @Param() paramData: GetUserByEmailRequestDto,
    ): Promise<GetUserByEmailResponseDto> {
        const result = await this.usersService.getUsersByTelegramIdOrEmail({
            email: paramData.email,
        });

        const data = errorHandler(result);
        return {
            response: data.map((item) => new GetFullUserResponseModel(item, this.subPublicDomain)),
        };
    }
}
