import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { SUBSCRIPTION_CONTROLLER, SUBSCRIPTION_ROUTES } from '@libs/contracts/api';
import { Controller, Get, Param, Req, Res, UseFilters } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GetSubscriptionInfoRequestDto, GetSubscriptionInfoResponseDto } from './dto';
import { GetSubscriptionByShortUuidRequestDto } from './dto/get-subscription.dto';
import { SubscriptionNotFoundResponse, SubscriptionRawResponse } from './models';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription Controller')
@UseFilters(HttpExceptionFilter)
@Controller(SUBSCRIPTION_CONTROLLER)
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @Get(SUBSCRIPTION_ROUTES.GET + '/:shortUuid')
    @ApiParam({
        name: 'shortUuid',
        type: String,
        description: 'Short UUID of the user',
        required: true,
    })
    async getSubscriptionByShortUuid(
        @Param() { shortUuid }: GetSubscriptionByShortUuidRequestDto,
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<Response> {
        const result = await this.subscriptionService.getSubscriptionByShortUuid(
            shortUuid,
            (request.headers['user-agent'] as string) || '',
            ((request.headers['accept'] as string) || '').includes('text/html'),
        );

        if (result instanceof SubscriptionNotFoundResponse) {
            return response.status(404).send(result);
        }

        if (result instanceof SubscriptionRawResponse) {
            return response.status(200).send(result);
        }

        return response.set(result.headers).type(result.contentType).send(result.body);
    }

    @Get('/:shortUuid' + SUBSCRIPTION_ROUTES.GET_INFO)
    @ApiParam({
        name: 'shortUuid',
        type: String,
        description: 'Short UUID of the user',
        required: true,
    })
    async getSubscriptionInfoByShortUuid(
        @Param() { shortUuid }: GetSubscriptionInfoRequestDto,
    ): Promise<GetSubscriptionInfoResponseDto> {
        const result = await this.subscriptionService.getSubscriptionInfoByShortUuid(shortUuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
