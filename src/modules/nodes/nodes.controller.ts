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
    Delete,
    Patch,
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
    DeleteNodeRequestParamDto,
    DeleteNodeResponseDto,
    DisableNodeRequestParamDto,
    DisableNodeResponseDto,
    EnableNodeResponseDto,
    GetAllNodesResponseDto,
    GetOneNodeRequestParamDto,
    GetOneNodeResponseDto,
    RestartAllNodesResponseDto,
    RestartNodeResponseDto,
    UpdateNodeRequestDto,
    UpdateNodeResponseDto,
} from './dtos';
import { EnableNodeRequestParamDto } from './dtos';
import { errorHandler } from '@common/helpers/error-handler.helper';
import {
    CreateNodeResponseModel,
    GetAllNodesResponseModel,
    GetOneNodeResponseModel,
} from './models';
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

    @Get(NODES_ROUTES.GET_ALL)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get All Nodes', description: 'Get all nodes' })
    @ApiOkResponse({
        type: [GetAllNodesResponseDto],
        description: 'Nodes fetched',
    })
    async getAllNodes(): Promise<GetAllNodesResponseDto> {
        const res = await this.nodesService.getAllNodes();
        const data = errorHandler(res);
        return {
            response: data.map((node) => new GetAllNodesResponseModel(node)),
        };
    }

    @Get(NODES_ROUTES.GET_ONE + '/:uuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get One Node', description: 'Get one node' })
    @ApiOkResponse({
        type: [GetOneNodeResponseDto],
        description: 'Node fetched',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    async getOneNode(@Param() uuid: GetOneNodeRequestParamDto): Promise<GetOneNodeResponseDto> {
        const res = await this.nodesService.getOneNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: new GetOneNodeResponseModel(data),
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
            response: new GetOneNodeResponseModel(data),
        };
    }

    @Get(NODES_ROUTES.DISABLE + '/:uuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Disable Node', description: 'Disable node' })
    @ApiOkResponse({
        type: [DisableNodeResponseDto],
        description: 'Node disabled',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    async disableNode(@Param() uuid: DisableNodeRequestParamDto): Promise<DisableNodeResponseDto> {
        const res = await this.nodesService.disableNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: new GetOneNodeResponseModel(data),
        };
    }

    @Delete(NODES_ROUTES.DELETE + '/:uuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete Node', description: 'Delete node' })
    @ApiOkResponse({
        type: [DeleteNodeResponseDto],
        description: 'Node deleted',
    })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    async deleteNode(@Param() uuid: DeleteNodeRequestParamDto): Promise<DeleteNodeResponseDto> {
        const res = await this.nodesService.deleteNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @Patch(NODES_ROUTES.UPDATE)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update Node', description: 'Update node' })
    @ApiOkResponse({
        type: [UpdateNodeResponseDto],
        description: 'Node updated',
    })
    async updateNode(@Body() body: UpdateNodeRequestDto): Promise<UpdateNodeResponseDto> {
        const res = await this.nodesService.updateNode(body);
        const data = errorHandler(res);
        return {
            response: new GetOneNodeResponseModel(data),
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
