import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { NodeCreatedEvent } from './node-created.event';
import { Logger } from '@nestjs/common';
import { AxiosService } from '@common/axios';
import { NodesRepository } from '../../repositories/nodes.repository';
import { ICommandResponse } from '@common/types/command-response.type';
import { GetPreparedConfigWithUsersQuery } from '../../../xray-config/queries/get-prepared-config-with-users';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';

@EventsHandler(NodeCreatedEvent)
export class NodeCreatedHandler implements IEventHandler<NodeCreatedEvent> {
    public readonly logger = new Logger(NodeCreatedHandler.name);

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
        private readonly queryBus: QueryBus,
    ) {}
    async handle(event: NodeCreatedEvent) {
        try {
            const nodeEntity = event.node;

            const startTime = Date.now();
            const config = await this.getConfigForNode();
            this.logger.debug(`Generated config for node in ${Date.now() - startTime}ms`);

            if (!config.isOk || !config.response) {
                throw new Error('Failed to get config for node');
            }

            const reqStartTime = Date.now();

            const res = await this.axios.startXray(
                config.response as unknown as Record<string, unknown>,
                nodeEntity.address,
                nodeEntity.port,
            );

            this.logger.debug(`Started node in ${Date.now() - reqStartTime}ms`);

            if (!res.isOk || !res.response) {
                nodeEntity.updateStatus({
                    isXrayRunning: false,
                    isNodeOnline: false,
                    lastStatusMessage: res.message ?? null,
                    lastStatusChange: new Date(),
                    isConnected: false,
                    isConnecting: false,
                    isDisabled: false,
                });
                await this.nodesRepository.update(nodeEntity);
                return;
            }

            const nodeResponse = res.response.response;

            this.logger.debug(`Node created: ${JSON.stringify(nodeResponse)}`);

            nodeEntity.updateStatus({
                isXrayRunning: nodeResponse.isStarted,
                xrayVersion: nodeResponse.version,
                isNodeOnline: true,
                isConnected: nodeResponse.isStarted,
                lastStatusMessage: nodeResponse.error ?? null,
                lastStatusChange: new Date(),
                isDisabled: false,
                isConnecting: false,
            });

            await this.nodesRepository.update(nodeEntity);

            return;
        } catch (error) {
            this.logger.error(`Error in NodeCreatedHandler: ${JSON.stringify(error)}`);
        }
    }

    private getConfigForNode(): Promise<ICommandResponse<IXrayConfig>> {
        return this.queryBus.execute<
            GetPreparedConfigWithUsersQuery,
            ICommandResponse<IXrayConfig>
        >(new GetPreparedConfigWithUsersQuery());
    }
}
