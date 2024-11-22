import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Logger } from '@nestjs/common';
import { GetOnlineNodesQuery } from './get-online-nodes.query';
import { NodesRepository } from '../../repositories/nodes.repository';
import { NodesEntity } from '../../entities/nodes.entity';

@QueryHandler(GetOnlineNodesQuery)
export class GetOnlineNodesHandler
    implements IQueryHandler<GetOnlineNodesQuery, ICommandResponse<NodesEntity[]>>
{
    private readonly logger = new Logger(GetOnlineNodesHandler.name);
    constructor(private readonly nodesRepository: NodesRepository) {}

    async execute(): Promise<ICommandResponse<NodesEntity[]>> {
        try {
            const nodes = await this.nodesRepository.findConnectedNodes();

            return {
                isOk: true,
                response: nodes,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
