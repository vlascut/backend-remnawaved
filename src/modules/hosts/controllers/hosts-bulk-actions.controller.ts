import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { RolesGuard } from '@common/guards/roles/roles.guard';
import { Roles } from '@common/decorators/roles/roles';
import { HOSTS_CONTROLLER, HOSTS_ROUTES } from '@libs/contracts/api/controllers';
import { ROLE } from '@libs/contracts/constants';

import {
    BulkDeleteHostsRequestDto,
    BulkDeleteHostsResponseDto,
    BulkDisableHostsRequestDto,
    BulkDisableHostsResponseDto,
    BulkEnableHostsRequestDto,
    BulkEnableHostsResponseDto,
    SetInboundToManyHostsRequestDto,
    SetInboundToManyHostsResponseDto,
    SetPortToManyHostsRequestDto,
    SetPortToManyHostsResponseDto,
} from '../dtos/bulk-operations.dto';
import { GetAllHostsResponseModel } from '../models/get-all-hosts.response.model';
import { HostsService } from '../hosts.service';

@ApiBearerAuth('Authorization')
@ApiTags('Hosts Bulk Actions Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(HOSTS_CONTROLLER)
export class HostsBulkActionsController {
    constructor(private readonly hostsService: HostsService) {}

    @ApiOkResponse({
        type: BulkDeleteHostsResponseDto,
        description: 'Hosts deleted successfully',
    })
    @ApiOperation({
        summary: 'Delete many hosts',
        description: 'Delete many hosts',
    })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.BULK.DELETE_HOSTS)
    async deleteHosts(
        @Body() body: BulkDeleteHostsRequestDto,
    ): Promise<BulkDeleteHostsResponseDto> {
        const result = await this.hostsService.deleteHosts(body.uuids);

        const data = errorHandler(result);
        return {
            response: data.map((host) => new GetAllHostsResponseModel(host)),
        };
    }

    @ApiOkResponse({
        type: BulkDisableHostsResponseDto,
        description: 'Hosts disabled successfully',
    })
    @ApiOperation({
        summary: 'Disable many hosts',
        description: 'Disable many hosts',
    })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.BULK.DISABLE_HOSTS)
    async disableHosts(
        @Body() body: BulkDisableHostsRequestDto,
    ): Promise<BulkDisableHostsResponseDto> {
        const result = await this.hostsService.bulkDisableHosts(body.uuids);

        const data = errorHandler(result);
        return {
            response: data.map((host) => new GetAllHostsResponseModel(host)),
        };
    }

    @ApiOkResponse({
        type: BulkEnableHostsResponseDto,
        description: 'Hosts enabled successfully',
    })
    @ApiOperation({
        summary: 'Enable many hosts',
        description: 'Enable many hosts',
    })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.BULK.ENABLE_HOSTS)
    async enableHosts(
        @Body() body: BulkEnableHostsRequestDto,
    ): Promise<BulkEnableHostsResponseDto> {
        const result = await this.hostsService.bulkEnableHosts(body.uuids);

        const data = errorHandler(result);
        return {
            response: data.map((host) => new GetAllHostsResponseModel(host)),
        };
    }

    @ApiOkResponse({
        type: SetInboundToManyHostsResponseDto,
        description: 'Hosts inbound set successfully',
    })
    @ApiOperation({
        summary: 'Set inbound to many hosts',
        description: 'Set inbound to many hosts',
    })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.BULK.SET_INBOUND)
    async setInboundToHosts(
        @Body() body: SetInboundToManyHostsRequestDto,
    ): Promise<SetInboundToManyHostsResponseDto> {
        const result = await this.hostsService.setInboundToHosts(body.uuids, body.inboundUuid);

        const data = errorHandler(result);
        return {
            response: data.map((host) => new GetAllHostsResponseModel(host)),
        };
    }

    @ApiOkResponse({
        type: SetPortToManyHostsResponseDto,
        description: 'Hosts port set successfully',
    })
    @ApiOperation({
        summary: 'Set port to many hosts',
        description: 'Set port to many hosts',
    })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.BULK.SET_PORT)
    async setPortToHosts(
        @Body() body: SetPortToManyHostsRequestDto,
    ): Promise<SetPortToManyHostsResponseDto> {
        const result = await this.hostsService.setPortToHosts(body.uuids, body.port);

        const data = errorHandler(result);
        return {
            response: data.map((host) => new GetAllHostsResponseModel(host)),
        };
    }
}
