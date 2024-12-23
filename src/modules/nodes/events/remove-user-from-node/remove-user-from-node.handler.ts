import { RemoveUserCommand as RemoveUserFromNodeCommandSdk } from '@remnawave/node-contract/build/commands';
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import pMap from '@cjs-exporter/p-map';

import { AxiosService } from '@common/axios';

import { RemoveUserFromNodeEvent } from './remove-user-from-node.event';
import { NodesRepository } from '../../repositories/nodes.repository';
import { NodesEntity } from '../../entities/nodes.entity';

@EventsHandler(RemoveUserFromNodeEvent)
export class RemoveUserFromNodeHandler implements IEventHandler<RemoveUserFromNodeEvent> {
    public readonly logger = new Logger(RemoveUserFromNodeHandler.name);

    private readonly CONCURRENCY: number;

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
    ) {
        this.CONCURRENCY = 10;
    }
    async handle(event: RemoveUserFromNodeEvent) {
        try {
            const userEntity = event.user;

            const nodes = await this.nodesRepository.findConnectedNodes();

            if (nodes.length === 0) {
                throw new Error('No connected nodes found');
            }

            if (userEntity.activeUserInbounds.length === 0) {
                return;
            }

            const userData: RemoveUserFromNodeCommandSdk.Request = {
                username: userEntity.username,
                tags: userEntity.activeUserInbounds.map((inbound) => inbound.tag),
            };

            const mapper = async (node: NodesEntity) => {
                const response = await this.axios.deleteUser(userData, node.address, node.port);
                return {
                    nodeName: node.name,
                    response,
                };
            };

            const result = await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

            const failedResults = result.filter((r) => !r.response.isOk);

            if (failedResults.length > 0) {
                this.logger.warn(
                    `Remove user from Node, failed nodes: ${failedResults
                        .map((r) => `[Node: ${r.nodeName}] ${JSON.stringify(r.response)}`)
                        .join(', ')}`,
                );
            }

            return;
        } catch (error) {
            this.logger.error(`Error in Event RemoveUserFromNodeHandler: ${error}`);
        }
    }
}
