import { Controller, Get, Param, UseFilters, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { SUBSCRIPTION_CONTROLLER, SUBSCRIPTION_ROUTES } from '../../../libs/contract';
import { GetSubscriptionByShortUuidRequestDto } from './dto/get-subscription.dto';
import { SubscriptionService } from './subscription.service';
import { SubscriptionNotFoundResponse, SubscriptionRawResponse } from './models';

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
}
