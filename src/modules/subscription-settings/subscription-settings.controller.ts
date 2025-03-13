import { SUBSCRIPTION_SETTINGS_CONTROLLER, SUBSCRIPTION_SETTINGS_ROUTES } from '@contract/api';
import { ROLE } from '@contract/constants';

import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';

import {
    GetSubscriptionSettingsResponseDto,
    UpdateSubscriptionSettingsRequestDto,
    UpdateSubscriptionSettingsResponseDto,
} from './dtos';
import { SubscriptionSettingsService } from './subscription-settings.service';

@ApiBearerAuth('Authorization')
@ApiTags('Subscriptions Settings Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(SUBSCRIPTION_SETTINGS_CONTROLLER)
export class SubscriptionSettingsController {
    constructor(private readonly subscriptionSettingsService: SubscriptionSettingsService) {}

    @ApiOkResponse({
        type: GetSubscriptionSettingsResponseDto,
        description: 'Subscription settings retrieved successfully',
    })
    @ApiOperation({
        summary: 'Get Subscription Settings',
        description: 'Get Subscription Settings',
    })
    @HttpCode(HttpStatus.OK)
    @Get(SUBSCRIPTION_SETTINGS_ROUTES.GET_SETTINGS)
    async getSettings(): Promise<GetSubscriptionSettingsResponseDto> {
        const result = await this.subscriptionSettingsService.getSubscriptionSettings();

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiBody({ type: UpdateSubscriptionSettingsRequestDto })
    @ApiOkResponse({
        type: UpdateSubscriptionSettingsResponseDto,
        description: 'Subscription settings updated successfully',
    })
    @ApiOperation({
        summary: 'Update Subscription Settings',
        description: 'Update Subscription Settings',
    })
    @HttpCode(HttpStatus.OK)
    @Post(SUBSCRIPTION_SETTINGS_ROUTES.UPDATE_SETTINGS)
    async updateSettings(
        @Body() body: UpdateSubscriptionSettingsRequestDto,
    ): Promise<UpdateSubscriptionSettingsResponseDto> {
        const result = await this.subscriptionSettingsService.updateSettings(body);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
