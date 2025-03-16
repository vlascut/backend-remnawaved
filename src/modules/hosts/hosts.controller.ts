import {
    Body,
    Controller,
    Delete,
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
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

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
} from './dtos/bulk-operations.dto';
import { ReorderHostRequestDto, ReorderHostResponseDto } from './dtos/reorder-hosts.dto';
import { CreateHostRequestDto, CreateHostResponseDto } from './dtos/create-host.dto';
import { DeleteHostRequestDto, DeleteHostResponseDto } from './dtos/delete-host.dto';
import { GetAllHostsResponseModel } from './models/get-all-hosts.response.model';
import { GetOneHostResponseModel } from './models/get-one-host.response.model';
import { CreateHostResponseModel } from './models/create-host.response.model';
import { UpdateHostResponseModel } from './models/update-host.response.model';
import { GetAllHostsResponseDto } from './dtos/get-all-hosts.dto';
import { UpdateHostResponseDto } from './dtos/update-host.dto';
import { UpdateHostRequestDto } from './dtos/update-host.dto';
import { GetOneHostResponseDto } from './dtos/get-one.dto';
import { GetOneHostRequestDto } from './dtos/get-one.dto';
import { HostsService } from './hosts.service';

@ApiBearerAuth('Authorization')
@ApiTags('Hosts Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(HOSTS_CONTROLLER)
export class HostsController {
    constructor(private readonly hostsService: HostsService) {}

    @ApiBody({ type: CreateHostRequestDto })
    @ApiOkResponse({
        type: CreateHostResponseDto,
        description: 'Host created successfully',
    })
    @ApiOperation({ summary: 'Create Host', description: 'Create a new host' })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.CREATE)
    async createHost(@Body() body: CreateHostRequestDto): Promise<CreateHostResponseDto> {
        const result = await this.hostsService.createHost(body);

        const data = errorHandler(result);
        return {
            response: new CreateHostResponseModel(data),
        };
    }

    @ApiBody({ type: UpdateHostRequestDto })
    @ApiOkResponse({
        type: UpdateHostResponseDto,
        description: 'Host updated successfully',
    })
    @ApiOperation({ summary: 'Update Host', description: 'Update a host' })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.UPDATE)
    async updateHost(@Body() body: UpdateHostRequestDto): Promise<UpdateHostResponseDto> {
        const result = await this.hostsService.updateHost(body);

        const data = errorHandler(result);
        return {
            response: new UpdateHostResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: GetAllHostsResponseDto,
        description: 'Hosts fetched successfully',
    })
    @ApiOperation({ summary: 'Get All Hosts', description: 'Get all hosts' })
    @HttpCode(HttpStatus.OK)
    @Get(HOSTS_ROUTES.GET_ALL)
    async getAllHosts(): Promise<GetAllHostsResponseDto> {
        const result = await this.hostsService.getAllHosts();

        const data = errorHandler(result);
        return {
            response: data.map((host) => new GetAllHostsResponseModel(host)),
        };
    }

    @ApiOkResponse({
        type: GetOneHostResponseDto,
        description: 'Host fetched successfully',
    })
    @ApiOperation({ summary: 'Get One Host', description: 'Get one host by uuid' })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the host', required: true })
    @HttpCode(HttpStatus.OK)
    @Get(HOSTS_ROUTES.GET_ONE + '/:uuid')
    async getOneHost(@Param() paramData: GetOneHostRequestDto): Promise<GetOneHostResponseDto> {
        const result = await this.hostsService.getOneHost(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: new GetOneHostResponseModel(data),
        };
    }

    @ApiBody({ type: ReorderHostRequestDto })
    @ApiOkResponse({
        type: ReorderHostResponseDto,
        description: 'Hosts reordered successfully',
    })
    @ApiOperation({ summary: 'Reorder Hosts', description: 'Reorder hosts' })
    @HttpCode(HttpStatus.OK)
    @Post(HOSTS_ROUTES.REORDER)
    async reorderHosts(@Body() body: ReorderHostRequestDto): Promise<ReorderHostResponseDto> {
        const result = await this.hostsService.reorderHosts(body);

        const data = errorHandler(result);
        return {
            response: {
                isUpdated: data.isUpdated,
            },
        };
    }

    @ApiNotFoundResponse({
        description: 'Host not found',
    })
    @ApiOkResponse({
        type: DeleteHostResponseDto,
        description: 'Host deleted successfully',
    })
    @ApiOperation({
        summary: 'Delete Host',
        description: 'Delete host',
    })
    @HttpCode(HttpStatus.OK)
    @Delete(HOSTS_ROUTES.DELETE + '/:uuid')
    async deleteHost(@Param() paramData: DeleteHostRequestDto): Promise<DeleteHostResponseDto> {
        const result = await this.hostsService.deleteHost(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }

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
