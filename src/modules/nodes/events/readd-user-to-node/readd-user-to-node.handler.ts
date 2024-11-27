import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AxiosService } from '@common/axios';
import { NodesRepository } from '../../repositories/nodes.repository';
import { ReaddUserToNodeEvent } from './readd-user-to-node.event';
import { AddUserCommand as AddUserToNodeCommandSdk } from '@remnawave/node-contract/build/commands';
import { NodesEntity } from '../../entities/nodes.entity';
import pMap from '@cjs-exporter/p-map';
import { RemoveUserCommand as RemoveUserFromNodeCommandSdk } from '@remnawave/node-contract/build/commands';

@EventsHandler(ReaddUserToNodeEvent)
export class ReaddUserToNodeHandler implements IEventHandler<ReaddUserToNodeEvent> {
    public readonly logger = new Logger(ReaddUserToNodeHandler.name);

    private readonly CONCURRENCY: number;

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
    ) {
        this.CONCURRENCY = 10;
    }
    async handle(event: ReaddUserToNodeEvent) {
        try {
            const userEntity = event.user;

            const nodes = await this.nodesRepository.findConnectedNodes();

            if (nodes.length === 0) {
                throw new Error('No connected nodes found');
            }

            /// REMOVING USER FROM NODE

            const removeUserData: RemoveUserFromNodeCommandSdk.Request = {
                username: userEntity.username,
                tags: event.oldInboundTags,
            };

            const removeMapper = async (node: NodesEntity) => {
                const response = await this.axios.deleteUser(
                    removeUserData,
                    node.address,
                    node.port,
                );
                return response;
            };

            const removeResult = await pMap(nodes, removeMapper, { concurrency: this.CONCURRENCY });

            /// ADDING USER TO NODE

            const userData: AddUserToNodeCommandSdk.Request = {
                data: userEntity.activeUserInbounds.map((inbound) => {
                    const inboundType = inbound.type;

                    switch (inboundType) {
                        case 'trojan':
                            return {
                                type: inboundType,
                                username: userEntity.username,
                                password: userEntity.trojanPassword,
                                level: 0,
                                tag: inbound.tag,
                            };
                        case 'vless':
                            return {
                                type: inboundType,
                                username: userEntity.username,
                                uuid: userEntity.vlessUuid,
                                flow: '',
                                level: 0,
                                tag: inbound.tag,
                            };
                        default:
                            throw new Error(`Unsupported inbound type: ${inboundType}`);
                    }
                }),
            };

            const mapper = async (node: NodesEntity) => {
                const response = await this.axios.addUser(userData, node.address, node.port);
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
