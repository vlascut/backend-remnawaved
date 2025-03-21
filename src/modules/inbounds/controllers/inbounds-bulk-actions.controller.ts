import {
    Post,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';
import { INBOUNDS_CONTROLLER, INBOUNDS_ROUTES } from '@libs/contracts/api';
import { ROLE } from '@libs/contracts/constants';

import {
    AddInboundToNodesRequestDto,
    AddInboundToNodesResponseDto,
    AddInboundToUsersRequestDto,
    AddInboundToUsersResponseDto,
    RemoveInboundFromNodesRequestDto,
    RemoveInboundFromNodesResponseDto,
    RemoveInboundFromUsersRequestDto,
    RemoveInboundFromUsersResponseDto,
} from '../dtos';
import { BulkOperationResponseModel } from '../models';
import { InboundsService } from '../inbounds.service';

@ApiBearerAuth('Authorization')
@ApiTags('Inbounds Bulk Actions Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(INBOUNDS_CONTROLLER)
export class InboundsBulkActionsController {
    constructor(private readonly inboundsService: InboundsService) {}

    @ApiOkResponse({
        type: [AddInboundToUsersResponseDto],
        description: 'Add inbound to users',
    })
    @ApiOperation({ summary: 'Add Inbound To Users', description: 'Add inbound to users' })
    @HttpCode(HttpStatus.OK)
    @Post(INBOUNDS_ROUTES.BULK.ADD_INBOUND_TO_USERS)
    async addInboundToUsers(
        @Body() body: AddInboundToUsersRequestDto,
    ): Promise<AddInboundToUsersResponseDto> {
        const result = await this.inboundsService.addInboundToUsers(body.inboundUuid);

        const data = errorHandler(result);
        return {
            response: new BulkOperationResponseModel(data.isSuccess),
        };
    }

    @ApiOkResponse({
        type: [RemoveInboundFromUsersResponseDto],
        description: 'Remove inbound from users',
    })
    @ApiOperation({
        summary: 'Remove Inbound From Users',
        description: 'Remove inbound from users',
    })
    @HttpCode(HttpStatus.OK)
    @Post(INBOUNDS_ROUTES.BULK.REMOVE_INBOUND_FROM_USERS)
    async removeInboundFromUsers(
        @Body() body: RemoveInboundFromUsersRequestDto,
    ): Promise<RemoveInboundFromUsersResponseDto> {
        const result = await this.inboundsService.removeInboundFromUsers(body.inboundUuid);

        const data = errorHandler(result);
        return {
            response: new BulkOperationResponseModel(data.isSuccess),
        };
    }

    @ApiOkResponse({
        type: [AddInboundToNodesResponseDto],
        description: 'Inbound successfully added to all nodes',
    })
    @ApiOperation({
        summary: 'Add Inbound To All Nodes',
        description: 'Add inbound to all nodes',
    })
    @HttpCode(HttpStatus.OK)
    @Post(INBOUNDS_ROUTES.BULK.ADD_INBOUND_TO_NODES)
    async addInboundToNodes(
        @Body() body: AddInboundToNodesRequestDto,
    ): Promise<AddInboundToNodesResponseDto> {
        const result = await this.inboundsService.addInboundToNodes(body.inboundUuid);

        const data = errorHandler(result);
        return {
            response: new BulkOperationResponseModel(data.isSuccess),
        };
    }

    @ApiOkResponse({
        type: [RemoveInboundFromNodesResponseDto],
        description: 'Inbound successfully removed from all nodes',
    })
    @ApiOperation({
        summary: 'Remove Inbound From All Nodes',
        description: 'Remove inbound from all nodes',
    })
    @HttpCode(HttpStatus.OK)
    @Post(INBOUNDS_ROUTES.BULK.REMOVE_INBOUND_FROM_NODES)
    async removeInboundFromNodes(
        @Body() body: RemoveInboundFromNodesRequestDto,
    ): Promise<RemoveInboundFromNodesResponseDto> {
        const result = await this.inboundsService.removeInboundFromNodes(body.inboundUuid);

        const data = errorHandler(result);
        return {
            response: new BulkOperationResponseModel(data.isSuccess),
        };
    }
}
