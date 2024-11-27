import { Roles } from '@common/decorators/roles/roles';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles/roles.guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { HOSTS_CONTROLLER, HOSTS_ROUTES } from '@libs/contracts/api/controllers';
import { ROLE } from '@libs/contracts/constants';
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
import { CreateHostRequestDto, CreateHostResponseDto } from './dtos/create-host.dto';
import { DeleteHostRequestDto, DeleteHostResponseDto } from './dtos/delete-host.dto';
import { HostsService } from './hosts.service';
import { CreateHostResponseModel } from './models/create-host.response.model';
import { GetAllHostsResponseDto } from './dtos/get-all-hosts.dto';
import { GetAllHostsResponseModel } from './models/get-all-hosts.response.model';

@ApiTags('Hosts Controller')
@ApiBearerAuth('Authorization')
@UseFilters(HttpExceptionFilter)
@Controller(HOSTS_CONTROLLER)
@UseGuards(JwtDefaultGuard, RolesGuard)
@Roles(ROLE.ADMIN, ROLE.API)
export class HostsController {
    constructor(private readonly hostsService: HostsService) {}

    @Post(HOSTS_ROUTES.CREATE)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create Host', description: 'Create a new host' })
    @ApiOkResponse({
        type: CreateHostResponseDto,
        description: 'Host created successfully',
    })
    @ApiBody({ type: CreateHostRequestDto })
    async createHost(@Body() body: CreateHostRequestDto): Promise<CreateHostResponseDto> {
        const result = await this.hostsService.createHost(body);

        const data = errorHandler(result);
        return {
            response: new CreateHostResponseModel(data),
        };
    }

    @Get(HOSTS_ROUTES.GET_ALL)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get All Hosts', description: 'Get all hosts' })
    @ApiOkResponse({
        type: GetAllHostsResponseDto,
        description: 'Hosts fetched successfully',
    })
    async getAllHosts(): Promise<GetAllHostsResponseDto> {
        const result = await this.hostsService.getAllHosts();

        const data = errorHandler(result);
        return {
            response: data.map((host) => new GetAllHostsResponseModel(host)),
        };
    }

    @Delete(HOSTS_ROUTES.DELETE)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete Host',
        description: 'Delete host',
    })
    @ApiOkResponse({
        type: DeleteHostResponseDto,
        description: 'Host deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'Host not found',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'UUID of the host', required: true })
    async deleteHost(@Param() paramData: DeleteHostRequestDto): Promise<DeleteHostResponseDto> {
        const result = await this.hostsService.deleteHost(paramData.uuid);

        const data = errorHandler(result);
        return {
            response: data,
        };
    }
}
