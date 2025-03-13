import { SUBSCRIPTION_TEMPLATE_CONTROLLER, SUBSCRIPTION_TEMPLATE_ROUTES } from '@contract/api';
import { ROLE, TSubscriptionTemplateType } from '@contract/constants';

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
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';

import { GetTemplateRequestDto, GetTemplateResponseDto } from './dtos/get-template.dto';
import { SubscriptionTemplateService } from './subscription-template.service';
import { UpdateTemplateResponseDto } from './dtos/update-template.dto';
import { UpdateTemplateRequestDto } from './dtos/update-template.dto';

@ApiBearerAuth('Authorization')
@ApiTags('Subscriptions Template Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(SUBSCRIPTION_TEMPLATE_CONTROLLER)
export class SubscriptionTemplateController {
    constructor(private readonly subscriptionTemplateService: SubscriptionTemplateService) {}

    @ApiOkResponse({
        type: GetTemplateResponseDto,
        description: 'Template retrieved successfully',
    })
    @ApiOperation({ summary: 'Get Template', description: 'Get Template' })
    @HttpCode(HttpStatus.OK)
    @Get(SUBSCRIPTION_TEMPLATE_ROUTES.GET_TEMPLATE + '/' + ':templateType')
    async getTemplate(@Param() paramData: GetTemplateRequestDto): Promise<GetTemplateResponseDto> {
        const result = await this.subscriptionTemplateService.getTemplate(
            paramData.templateType as TSubscriptionTemplateType,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiBody({ type: UpdateTemplateRequestDto })
    @ApiOkResponse({
        type: UpdateTemplateResponseDto,
        description: 'Template updated successfully',
    })
    @ApiOperation({ summary: 'Update Template', description: 'Update Template' })
    @HttpCode(HttpStatus.OK)
    @Post(SUBSCRIPTION_TEMPLATE_ROUTES.UPDATE_TEMPLATE)
    async updateTemplate(
        @Body() body: UpdateTemplateRequestDto,
    ): Promise<UpdateTemplateResponseDto> {
        const result = await this.subscriptionTemplateService.updateTemplate(
            body.templateType as TSubscriptionTemplateType,
            body.templateJson ?? undefined,
            body.encodedTemplateYaml ?? undefined,
        );

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
