import {
    Body,
    Controller,
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
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { HWID_CONTROLLER, HWID_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import {
    CreateUserHwidDeviceRequestDto,
    CreateUserHwidDeviceResponseDto,
    DeleteUserHwidDeviceRequestDto,
    DeleteUserHwidDeviceResponseDto,
    GetUserHwidDevicesRequestDto,
    GetUserHwidDevicesResponseDto,
} from './dtos';
import { HwidUserDevicesService } from './hwid-user-devices.service';
import { BaseUserHwidDevicesResponseModel } from './models';

@ApiBearerAuth('Authorization')
@ApiTags('HWID User Devices')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(HWID_CONTROLLER)
export class HwidUserDevicesController {
    constructor(private readonly hwidUserDevicesService: HwidUserDevicesService) {}

    @ApiBody({ type: CreateUserHwidDeviceRequestDto })
    @ApiOkResponse({
        type: CreateUserHwidDeviceResponseDto,
        description: 'User HWID device created successfully',
    })
    @ApiOperation({
        summary: 'Create user HWID device',
        description: 'Create user HWID device',
    })
    @HttpCode(HttpStatus.OK)
    @Post(HWID_ROUTES.CREATE_USER_HWID_DEVICE)
    async createUserHwidDevice(
        @Body() body: CreateUserHwidDeviceRequestDto,
    ): Promise<CreateUserHwidDeviceResponseDto> {
        const result = await this.hwidUserDevicesService.createUserHwidDevice(body);

        const data = errorHandler(result);
        return {
            response: data.map((item) => new BaseUserHwidDevicesResponseModel(item)),
        };
    }

    @ApiBody({ type: DeleteUserHwidDeviceRequestDto })
    @ApiOkResponse({
        type: DeleteUserHwidDeviceResponseDto,
        description: 'User HWID device deleted successfully',
    })
    @ApiOperation({
        summary: 'Delete user HWID device',
        description: 'Delete user HWID device',
    })
    @HttpCode(HttpStatus.OK)
    @Post(HWID_ROUTES.DELETE_USER_HWID_DEVICE)
    async deleteUserHwidDevice(
        @Body() body: DeleteUserHwidDeviceRequestDto,
    ): Promise<DeleteUserHwidDeviceResponseDto> {
        const result = await this.hwidUserDevicesService.deleteUserHwidDevice(
            body.hwid,
            body.userUuid,
        );

        const data = errorHandler(result);
        return {
            response: data.map((item) => new BaseUserHwidDevicesResponseModel(item)),
        };
    }

    @ApiOkResponse({
        type: GetUserHwidDevicesResponseDto,
        description: 'User HWID devices fetched successfully',
    })
    @ApiOperation({
        summary: 'Get user HWID devices',
        description: 'Get user HWID devices',
    })
    @ApiParam({ name: 'userUuid', type: String, description: 'UUID of the user', required: true })
    @HttpCode(HttpStatus.OK)
    @Get(HWID_ROUTES.GET_USER_HWID_DEVICES + '/:userUuid')
    async getUserHwidDevices(
        @Param() paramData: GetUserHwidDevicesRequestDto,
    ): Promise<GetUserHwidDevicesResponseDto> {
        const result = await this.hwidUserDevicesService.getUserHwidDevices(paramData.userUuid);

        const data = errorHandler(result);
        return {
            response: data.map((item) => new BaseUserHwidDevicesResponseModel(item)),
        };
    }
}
