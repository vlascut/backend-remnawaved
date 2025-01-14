import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { NODES_CONTROLLER, NODES_ROUTES } from '@contract/api';
import { RolesGuard } from '@common/guards/roles/roles.guard';
import { Roles } from '@common/decorators/roles/roles';
import { ROLE } from '@contract/constants';

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
    ReorderNodeRequestDto,
    ReorderNodeResponseDto,
    RestartAllNodesResponseDto,
    RestartNodeResponseDto,
    UpdateNodeRequestDto,
    UpdateNodeResponseDto,
} from './dtos';
import {
    CreateNodeResponseModel,
    GetAllNodesResponseModel,
    GetOneNodeResponseModel,
} from './models';
import { EnableNodeRequestParamDto } from './dtos';
import { NodesService } from './nodes.service';

@ApiBearerAuth('Authorization')
@ApiTags('Nodes Controller')
@Controller(NODES_CONTROLLER)
@Roles(ROLE.ADMIN, ROLE.API)
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtDefaultGuard, RolesGuard)
export class NodesController {
    constructor(private readonly nodesService: NodesService) {}

    @ApiBody({ type: CreateNodeRequestDto })
    @ApiOkResponse({
        type: CreateNodeResponseDto,
        description: 'Node created successfully',
    })
    @ApiOperation({ summary: 'Create Node', description: 'Create a new node' })
    @HttpCode(HttpStatus.OK)
    @Post(NODES_ROUTES.CREATE)
    async createNode(@Body() body: CreateNodeRequestDto): Promise<CreateNodeResponseDto> {
        const result = await this.nodesService.createNode(body);

        const data = errorHandler(result);
        return {
            response: new CreateNodeResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: [GetAllNodesResponseDto],
        description: 'Nodes fetched',
    })
    @ApiOperation({ summary: 'Get All Nodes', description: 'Get all nodes' })
    @Get(NODES_ROUTES.GET_ALL)
    @HttpCode(HttpStatus.OK)
    async getAllNodes(): Promise<GetAllNodesResponseDto> {
        const res = await this.nodesService.getAllNodes();
        const data = errorHandler(res);
        return {
            response: data.map((node) => new GetAllNodesResponseModel(node)),
        };
    }

    @ApiOkResponse({
        type: [GetOneNodeResponseDto],
        description: 'Node fetched',
    })
    @ApiOperation({ summary: 'Get One Node', description: 'Get one node' })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    @Get(NODES_ROUTES.GET_ONE + '/:uuid')
    @HttpCode(HttpStatus.OK)
    async getOneNode(@Param() uuid: GetOneNodeRequestParamDto): Promise<GetOneNodeResponseDto> {
        const res = await this.nodesService.getOneNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: new GetOneNodeResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: [EnableNodeResponseDto],
        description: 'Node enabled',
    })
    @ApiOperation({ summary: 'Enable Node', description: 'Enable node to further use' })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    @HttpCode(HttpStatus.OK)
    @Patch(NODES_ROUTES.ENABLE + '/:uuid')
    async enableNode(@Param() uuid: EnableNodeRequestParamDto): Promise<EnableNodeResponseDto> {
        const res = await this.nodesService.enableNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: new GetOneNodeResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: [DisableNodeResponseDto],
        description: 'Node disabled',
    })
    @ApiOperation({ summary: 'Disable Node', description: 'Disable node' })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    @HttpCode(HttpStatus.OK)
    @Patch(NODES_ROUTES.DISABLE + '/:uuid')
    async disableNode(@Param() uuid: DisableNodeRequestParamDto): Promise<DisableNodeResponseDto> {
        const res = await this.nodesService.disableNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: new GetOneNodeResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: [DeleteNodeResponseDto],
        description: 'Node deleted',
    })
    @ApiOperation({ summary: 'Delete Node', description: 'Delete node' })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    @Delete(NODES_ROUTES.DELETE + '/:uuid')
    @HttpCode(HttpStatus.OK)
    async deleteNode(@Param() uuid: DeleteNodeRequestParamDto): Promise<DeleteNodeResponseDto> {
        const res = await this.nodesService.deleteNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: [UpdateNodeResponseDto],
        description: 'Node updated',
    })
    @ApiOperation({ summary: 'Update Node', description: 'Update node' })
    @HttpCode(HttpStatus.OK)
    @Post(NODES_ROUTES.UPDATE)
    async updateNode(@Body() body: UpdateNodeRequestDto): Promise<UpdateNodeResponseDto> {
        const res = await this.nodesService.updateNode(body);
        const data = errorHandler(res);
        return {
            response: new GetOneNodeResponseModel(data),
        };
    }

    @ApiOkResponse({
        type: [RestartNodeResponseDto],
        description: 'Node restarted',
    })
    @ApiOperation({ summary: 'Restart Node', description: 'Restart node' })
    @ApiParam({ name: 'uuid', type: String, description: 'Node UUID' })
    @Get(NODES_ROUTES.RESTART + '/:uuid')
    @HttpCode(HttpStatus.OK)
    async restartNode(@Param() uuid: EnableNodeRequestParamDto): Promise<RestartNodeResponseDto> {
        const res = await this.nodesService.restartNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiOkResponse({
        type: [RestartNodeResponseDto],
        description: 'Node restarted',
    })
    @ApiOperation({ summary: 'Restart All Nodes', description: 'Restart all nodes' })
    @HttpCode(HttpStatus.OK)
    @Patch(NODES_ROUTES.RESTART_ALL)
    async restartAllNodes(): Promise<RestartAllNodesResponseDto> {
        const res = await this.nodesService.restartAllNodes();
        const data = errorHandler(res);
        return {
            response: data,
        };
    }

    @ApiBody({ type: ReorderNodeRequestDto })
    @ApiOkResponse({
        type: ReorderNodeResponseDto,
        description: 'Nodes reordered successfully',
    })
    @ApiOperation({ summary: 'Reorder Nodes', description: 'Reorder nodes' })
    @HttpCode(HttpStatus.OK)
    @Post(NODES_ROUTES.REORDER)
    async reorderNodes(@Body() body: ReorderNodeRequestDto): Promise<ReorderNodeResponseDto> {
        const result = await this.nodesService.reorderNodes(body);

        const data = errorHandler(result);
        return {
            response: data.map((node) => new GetAllNodesResponseModel(node)),
        };
    }
}
