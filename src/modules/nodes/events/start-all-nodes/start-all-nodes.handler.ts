import pMap from '@cjs-exporter/p-map';

import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { AxiosService } from '@common/axios';

import { GetPreparedConfigWithUsersQuery } from '../../../xray-config/queries/get-prepared-config-with-users';
import { NodesRepository } from '../../repositories/nodes.repository';
import { StartAllNodesEvent } from './start-all-nodes.event';
import { NodesEntity } from '../../entities/nodes.entity';

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
    async handle() {
        try {
            const nodes = await this.nodesRepository.findByCriteria({
                isDisabled: false,
            });

            const mapper = async (node: NodesEntity) => {
                let config: ICommandResponse<IXrayConfig> | null = null;

                config = await this.getConfigForNode({
                    excludedInbounds: node.excludedInbounds,
                });

                if (!config.isOk || !config.response) {
                    return;
                }

                const response = await this.axios.startXray(
                    config.response as unknown as Record<string, unknown>,
                    node.address,
                    node.port,
                );

                config = null;

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
                            usersOnline: 0,
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
                            isConnecting: false,
                            usersOnline: 0,
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
            this.logger.error(`Error in Event StartAllNodesHandler: ${error}`);
        }
    }

    private getConfigForNode(
        dto: GetPreparedConfigWithUsersQuery,
    ): Promise<ICommandResponse<IXrayConfig>> {
        return this.queryBus.execute<
            GetPreparedConfigWithUsersQuery,
            ICommandResponse<IXrayConfig>
        >(new GetPreparedConfigWithUsersQuery(dto.excludedInbounds));
    }
}
