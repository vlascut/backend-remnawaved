import { Controller, Get, Param, Req, Res, UseFilters } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { SUBSCRIPTION_CONTROLLER, SUBSCRIPTION_ROUTES } from '@libs/contracts/api';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { errorHandler } from '@common/helpers/error-handler.helper';

import { GetSubscriptionInfoRequestDto, GetSubscriptionInfoResponseDto } from './dto';
import { GetSubscriptionByShortUuidRequestDto } from './dto/get-subscription.dto';
import { SubscriptionNotFoundResponse, SubscriptionRawResponse } from './models';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription Controller')
@Controller(SUBSCRIPTION_CONTROLLER)
@UseFilters(HttpExceptionFilter)
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @ApiParam({
        name: 'shortUuid',
        type: String,
        description: 'Short UUID of the user',
        required: true,
    })
    @Get('/:shortUuid' + SUBSCRIPTION_ROUTES.GET_INFO)
    async getSubscriptionInfoByShortUuid(
        @Param() { shortUuid }: GetSubscriptionInfoRequestDto,
    ): Promise<GetSubscriptionInfoResponseDto> {
        const result = await this.subscriptionService.getSubscriptionInfoByShortUuid(shortUuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

    @ApiParam({
        name: 'shortUuid',
        type: String,
        description: 'Short UUID of the user',
        required: true,
    })
    @ApiParam({
        name: 'encodedTag',
        type: String,
        description: 'Encoded tag for Outline config',
        required: false,
    })
    @Get(SUBSCRIPTION_ROUTES.GET + '/:shortUuid{/:type}{/:encodedTag}')
    async getSubscription(
        @Param() { shortUuid }: GetSubscriptionByShortUuidRequestDto,
        @Req() request: Request,
        @Res() response: Response,
        @Param('type') type?: string,
        @Param('encodedTag') encodedTag?: string,
    ): Promise<Response> {
        let isOutlineConfig = false;
        if (type === 'ss' && encodedTag) {
            isOutlineConfig = true;
        }

        const result = await this.subscriptionService.getSubscriptionByShortUuid(
            shortUuid,
            (request.headers['user-agent'] as string) || '',
            ((request.headers['accept'] as string) || '').includes('text/html'),
            isOutlineConfig,
            encodedTag,
        );

        if (result instanceof SubscriptionNotFoundResponse) {
            return response.status(404).send(result);
        }

        if (result instanceof SubscriptionRawResponse) {
            return response.status(200).send(result);
        }

        return response.set(result.headers).type(result.contentType).send(result.body);
    }
}
