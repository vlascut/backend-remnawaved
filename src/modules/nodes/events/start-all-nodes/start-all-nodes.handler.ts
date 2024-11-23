import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { StartAllNodesEvent } from './start-all-nodes.event';
import { Logger } from '@nestjs/common';
import { AxiosService } from '@common/axios';
import { NodesRepository } from '../../repositories/nodes.repository';
import { ICommandResponse } from '@common/types/command-response.type';
import { GetPreparedConfigWithUsersQuery } from '../../../xray-config/queries/get-prepared-config-with-users';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { NodesEntity } from '../../entities/nodes.entity';
import pMap from '@cjs-exporter/p-map';

@EventsHandler(StartAllNodesEvent)
export class StartAllNodesHandler implements IEventHandler<StartAllNodesEvent> {
    public readonly logger = new Logger(StartAllNodesHandler.name);

    private readonly CONCURRENCY: number;

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
        private readonly queryBus: QueryBus,
    ) {
        this.CONCURRENCY = 10;
    }
    async handle(event: StartAllNodesEvent) {
        try {
            const configRespone = await this.getConfigForNode();

            if (!configRespone.isOk || !configRespone.response) {
                throw new Error('Failed to get config for node');
            }

            const config = configRespone.response as unknown as Record<string, unknown>;

            const nodes = await this.nodesRepository.findByCriteria({
                isDisabled: false,
            });

            const mapper = async (node: NodesEntity) => {
                const response = await this.axios.startXray(config, node.address, node.port);
                switch (response.isOk) {
                    case false:
                        await this.nodesRepository.update({
                            uuid: node.uuid,
                            isXrayRunning: false,
                            isNodeOnline: false,
                            lastStatusMessage: response.message ?? null,
                            lastStatusChange: new Date(),
                            isConnected: false,
                            isConnecting: false,
                            isDisabled: false,
                        });

                        return;
                    case true:
                        if (!response.response?.response) {
                            throw new Error('Failed to start Xray');
                        }
                        const nodeResponse = response.response.response;

                        await this.nodesRepository.update({
                            uuid: node.uuid,
                            isXrayRunning: nodeResponse.isStarted,
                            xrayVersion: nodeResponse.version,
                            isNodeOnline: true,
                            isConnected: nodeResponse.isStarted,
                            lastStatusMessage: nodeResponse.error ?? null,
                            lastStatusChange: new Date(),
                            isDisabled: false,
                            isConnecting: false,
                            cpuCount: nodeResponse.systemInformation?.cpuCores ?? null,
                            cpuModel: nodeResponse.systemInformation?.cpuModel ?? null,
                            totalRam: nodeResponse.systemInformation?.memoryTotal ?? null,
                        });

                        return;
                }
            };

            await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

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
