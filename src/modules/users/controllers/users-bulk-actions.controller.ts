import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { USERS_CONTROLLER, USERS_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import {
    BulkAllResetTrafficUsersResponseDto,
    BulkAllUpdateUsersRequestDto,
    BulkAllUpdateUsersResponseDto,
    BulkDeleteUsersByStatusRequestDto,
    BulkDeleteUsersByStatusResponseDto,
    BulkDeleteUsersRequestDto,
    BulkDeleteUsersResponseDto,
    BulkResetTrafficUsersRequestDto,
    BulkResetTrafficUsersResponseDto,
    BulkRevokeUsersSubscriptionRequestDto,
    BulkRevokeUsersSubscriptionResponseDto,
    BulkUpdateUsersInboundsRequestDto,
    BulkUpdateUsersInboundsResponseDto,
    BulkUpdateUsersRequestDto,
    BulkUpdateUsersResponseDto,
} from '../dtos';
import { UsersService } from '../users.service';

@ApiBearerAuth('Authorization')
@ApiTags('Users Bulk Actions Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(USERS_CONTROLLER)
export class UsersBulkActionsController {
    public readonly subPublicDomain: string;
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {
        this.subPublicDomain = this.configService.getOrThrow<string>('SUB_PUBLIC_DOMAIN');
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
    @HttpCode(HttpStatus.OK)
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

    @ApiBody({ type: BulkDeleteUsersRequestDto })
    @ApiOkResponse({
        type: BulkDeleteUsersResponseDto,
        description: 'Users deleted successfully',
    })
    @ApiOperation({
        summary: 'Bulk Delete Users By UUIDs',
        description: 'Bulk delete users by UUIDs',
    })
    @HttpCode(HttpStatus.OK)
    @Post(USERS_ROUTES.BULK.DELETE)
    async bulkDeleteUsers(
        @Body() body: BulkDeleteUsersRequestDto,
    ): Promise<BulkDeleteUsersResponseDto> {
        const result = await this.usersService.bulkDeleteUsersByUuid(body.uuids);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiBody({ type: BulkRevokeUsersSubscriptionRequestDto })
    @ApiOkResponse({
        type: BulkRevokeUsersSubscriptionResponseDto,
        description: 'Users subscription revoked successfully',
    })
    @ApiOperation({
        summary: 'Bulk Revoke Users Subscription',
        description: 'Bulk revoke users subscription',
    })
    @HttpCode(HttpStatus.OK)
    @Post(USERS_ROUTES.BULK.REVOKE_SUBSCRIPTION)
    async bulkRevokeUsersSubscription(
        @Body() body: BulkRevokeUsersSubscriptionRequestDto,
    ): Promise<BulkRevokeUsersSubscriptionResponseDto> {
        const result = await this.usersService.bulkRevokeUsersSubscription(body.uuids);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiBody({ type: BulkResetTrafficUsersRequestDto })
    @ApiOkResponse({
        type: BulkResetTrafficUsersResponseDto,
        description: 'Users traffic reset successfully',
    })
    @ApiOperation({
        summary: 'Bulk Reset User Traffic',
        description: 'Bulk reset user traffic',
    })
    @HttpCode(HttpStatus.OK)
    @Post(USERS_ROUTES.BULK.RESET_TRAFFIC)
    async bulkResetUserTraffic(
        @Body() body: BulkResetTrafficUsersRequestDto,
    ): Promise<BulkResetTrafficUsersResponseDto> {
        const result = await this.usersService.bulkResetUserTraffic(body.uuids);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiBody({ type: BulkUpdateUsersRequestDto })
    @ApiOkResponse({
        type: BulkUpdateUsersResponseDto,
        description: 'Users updated successfully',
    })
    @ApiOperation({
        summary: 'Bulk Update Users',
        description: 'Bulk update users',
    })
    @HttpCode(HttpStatus.OK)
    @Post(USERS_ROUTES.BULK.UPDATE)
    async bulkUpdateUsers(
        @Body() body: BulkUpdateUsersRequestDto,
    ): Promise<BulkUpdateUsersResponseDto> {
        const result = await this.usersService.bulkUpdateUsers(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiBody({ type: BulkUpdateUsersInboundsRequestDto })
    @ApiOkResponse({
        type: BulkUpdateUsersInboundsResponseDto,
        description: 'Users inbounds updated successfully',
    })
    @ApiOperation({
        summary: 'Bulk Update Users Inbounds',
        description: 'Bulk update users inbounds',
    })
    @HttpCode(HttpStatus.OK)
    @Post(USERS_ROUTES.BULK.UPDATE_INBOUNDS)
    async bulkUpdateUsersInbounds(
        @Body() body: BulkUpdateUsersInboundsRequestDto,
    ): Promise<BulkUpdateUsersInboundsResponseDto> {
        const result = await this.usersService.bulkAddInboundsToUsers(
            body.uuids,
            body.activeUserInbounds,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiBody({ type: BulkAllUpdateUsersRequestDto })
    @ApiOkResponse({
        type: BulkAllUpdateUsersResponseDto,
        description: 'All users updated successfully',
    })
    @ApiOperation({
        summary: 'Bulk Update All Users',
        description: 'Bulk update all users',
    })
    @HttpCode(HttpStatus.OK)
    @Post(USERS_ROUTES.BULK.ALL.UPDATE)
    async bulkUpdateAllUsers(
        @Body() body: BulkAllUpdateUsersRequestDto,
    ): Promise<BulkAllUpdateUsersResponseDto> {
        const result = await this.usersService.bulkUpdateAllUsers(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: BulkAllResetTrafficUsersResponseDto,
        description: 'All users traffic reset successfully',
    })
    @ApiOperation({
        summary: 'Bulk Reset All Users Traffic',
        description: 'Bulk reset all users traffic',
    })
    @HttpCode(HttpStatus.OK)
    @Patch(USERS_ROUTES.BULK.ALL.RESET_TRAFFIC)
    async bulkAllResetUserTraffic(): Promise<BulkAllResetTrafficUsersResponseDto> {
        const result = await this.usersService.bulkAllResetUserTraffic();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
