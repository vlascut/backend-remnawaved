import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { StopNodeEvent } from './stop-node.event';
import { Logger } from '@nestjs/common';
import { AxiosService } from '@common/axios';
import { NodesRepository } from '../../repositories/nodes.repository';

@EventsHandler(StopNodeEvent)
export class StopNodeHandler implements IEventHandler<StopNodeEvent> {
    public readonly logger = new Logger(StopNodeHandler.name);

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
        private readonly queryBus: QueryBus,
    ) {}
    async handle(event: StopNodeEvent) {
        try {
            const nodeEntity = event.node;

            await this.axios.stopXray(nodeEntity.address, nodeEntity.port);

            await this.nodesRepository.update({
                uuid: nodeEntity.uuid,
                isXrayRunning: false,
                isNodeOnline: false,
                lastStatusMessage: null,
                lastStatusChange: new Date(),
                isConnected: false,
                isConnecting: false,
                isDisabled: true,
            });
            return;
        } catch (error) {
            this.logger.error(`Error in NodeCreatedHandler: ${JSON.stringify(error)}`);
        }
    }
}
