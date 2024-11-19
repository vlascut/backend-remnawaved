import { Controller, Get, HttpCode, HttpStatus, Param, UseFilters } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NODES_CONTROLLER, NODES_ROUTES } from '@contract/api';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { CommandBus } from '@nestjs/cqrs';
import { ROLE } from '@contract/constants';
import { Roles } from '@common/decorators/roles/roles';
import { EnableNodeResponseDto } from './dtos';
import { EnableNodeRequestParamDto } from './dtos';
import { errorHandler } from '../../common/helpers/error-handler.helper';
import { EnableNodeResponseModel } from './models';

@ApiTags('Nodes Controller')
@UseFilters(HttpExceptionFilter)
@Controller(NODES_CONTROLLER)
export class NodesController {
    constructor(
        private readonly nodesService: NodesService,
        private readonly commandBus: CommandBus,
    ) {}

    @Get(NODES_ROUTES.ENABLE + '/:uuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enable Node', description: 'Enable node to further use' })
    @ApiOkResponse({
        type: [EnableNodeResponseDto],
        description: 'Node enabled',
    })
    @Roles(ROLE.ADMIN, ROLE.API)
    async enableNode(@Param() uuid: EnableNodeRequestParamDto): Promise<EnableNodeResponseDto> {
        const res = await this.nodesService.enableNode(uuid.uuid);
        const data = errorHandler(res);
        return {
            response: new EnableNodeResponseModel(data),
        };
    }
}
