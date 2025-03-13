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
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the host', required: true })
    @HttpCode(HttpStatus.OK)
    @Delete(HOSTS_ROUTES.DELETE + '/:uuid')
    async deleteHost(@Param() paramData: DeleteHostRequestDto): Promise<DeleteHostResponseDto> {
        const result = await this.hostsService.deleteHost(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
