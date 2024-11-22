import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Body,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NODES_CONTROLLER, NODES_ROUTES } from '@contract/api';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { CommandBus } from '@nestjs/cqrs';
import { ROLE } from '@contract/constants';
import { Roles } from '@common/decorators/roles/roles';
import {
    CreateNodeRequestDto,
    CreateNodeResponseDto,
    EnableNodeResponseDto,
    RestartAllNodesResponseDto,
    RestartNodeResponseDto,
} from './dtos';
import { EnableNodeRequestParamDto } from './dtos';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { EnableNodeResponseModel, CreateNodeResponseModel } from './models';
import { RolesGuard } from '@common/guards/roles/roles.guard';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';

@ApiTags('Nodes Controller')
@ApiBearerAuth('Authorization')
@UseFilters(HttpExceptionFilter)
@Controller(NODES_CONTROLLER)
@UseGuards(JwtDefaultGuard, RolesGuard)
@Roles(ROLE.ADMIN, ROLE.API)
export class NodesController {
    constructor(
        private readonly nodesService: NodesService,
        private readonly commandBus: CommandBus,
    ) {}

    @Post(NODES_ROUTES.CREATE)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create Node', description: 'Create a new node' })
    @ApiOkResponse({
        type: CreateNodeResponseDto,
        description: 'Node created successfully',
    })
    @ApiBody({ type: CreateNodeRequestDto })
    async createNode(@Body() body: CreateNodeRequestDto): Promise<CreateNodeResponseDto> {
        const result = await this.nodesService.createNode(body);

        const data = errorHandler(result);
        return {
            response: new CreateNodeResponseModel(data),
        };
    }

    @Get(NODES_ROUTES.ENABLE + '/:uuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enable Node', description: 'Enable node to further use' })
    @ApiOkResponse({
        type: [EnableNodeResponseDto],
        description: 'Node enabled',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    async enableNode(@Param() uuid: EnableNodeRequestParamDto): Promise<EnableNodeResponseDto> {
        const res = await this.nodesService.enableNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: new EnableNodeResponseModel(data),
        };
    }

    @Get(NODES_ROUTES.RESTART + '/:uuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Restart Node', description: 'Restart node' })
    @ApiOkResponse({
        type: [RestartNodeResponseDto],
        description: 'Node restarted',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    async restartNode(@Param() uuid: EnableNodeRequestParamDto): Promise<RestartNodeResponseDto> {
        const res = await this.nodesService.restartNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @Get(NODES_ROUTES.RESTART_ALL)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Restart All Nodes', description: 'Restart all nodes' })
    @ApiOkResponse({
        type: [RestartNodeResponseDto],
        description: 'Node restarted',
    })
    async restartAllNodes(): Promise<RestartAllNodesResponseDto> {
        const res = await this.nodesService.restartAllNodes();
        const data = errorHandler(res);
        return {
            response: data,
        };
    }
}
