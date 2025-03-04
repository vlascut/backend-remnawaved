import pMap from '@cjs-exporter/p-map';

import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { AxiosService } from '@common/axios';

import { GetPreparedConfigWithUsersQuery } from '@modules/users/queries/get-prepared-config-with-users';

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
        const startTime = Date.now();

        try {
            const nodes = await this.nodesRepository.findByCriteria({
                isDisabled: false,
            });

            for (const node of nodes) {
                await this.nodesRepository.update({
                    uuid: node.uuid,
                    isConnecting: true,
                });
            }

            const config = await this.getConfigForNode({
                excludedInbounds: [],
                excludeInboundsFromConfig: false,
            });

            this.logger.log(`Config for all nodes fetched within: ${Date.now() - startTime}ms`);

            if (!config.isOk || !config.response) {
                throw new Error('Failed to get config');
            }

            const mapper = async (node: NodesEntity) => {
                if (!config.response) {
                    throw new Error('Failed to get config');
                }

                const excludedNodeInboundsTags = node.excludedInbounds.map(
                    (inbound) => inbound.tag,
                );

                const nodeConfig = config.response;

                nodeConfig.inbounds = nodeConfig.inbounds.filter(
                    (inbound) => !excludedNodeInboundsTags.includes(inbound.tag),
                );

                const response = await this.axios.startXray(
                    nodeConfig as unknown as Record<string, unknown>,
                    node.address,
                    node.port,
                );

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

            this.logger.log(`Started all nodes in ${Date.now() - startTime}ms`);

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
