import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AxiosService } from '@common/axios';
import { NodesRepository } from '../../repositories/nodes.repository';
import { RemoveUserFromNodeEvent } from './remove-user-from-node.event';
import { RemoveUserCommand as RemoveUserFromNodeCommandSdk } from '@remnawave/node-contract/build/commands';
import { NodesEntity } from '../../entities/nodes.entity';
import pMap from '@cjs-exporter/p-map';

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

            const userData: RemoveUserFromNodeCommandSdk.Request = {
                username: userEntity.username,
                tags: userEntity.activeUserInbounds.map((inbound) => inbound.tag),
            };

            const mapper = async (node: NodesEntity) => {
                const response = await this.axios.deleteUser(userData, node.address, node.port);
                return response;
            };

            const result = await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

            this.logger.log(`Result: ${JSON.stringify(result)}`);

            return;
        } catch (error) {
            this.logger.error(`Error in NodeCreatedHandler: ${JSON.stringify(error)}`);
        }
    }
}
