import { AddUserCommand as AddUserToNodeCommandSdk } from '@remnawave/node-contract/build/commands';
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import pMap from '@cjs-exporter/p-map';

import { AxiosService } from '@common/axios';

import { NodesRepository } from '../../repositories/nodes.repository';
import { AddUserToNodeEvent } from './add-user-to-node.event';
import { NodesEntity } from '../../entities/nodes.entity';

@EventsHandler(AddUserToNodeEvent)
export class AddUserToNodeHandler implements IEventHandler<AddUserToNodeEvent> {
    public readonly logger = new Logger(AddUserToNodeHandler.name);

    private readonly CONCURRENCY: number;

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
    ) {
        this.CONCURRENCY = 10;
    }
    async handle(event: AddUserToNodeEvent) {
        try {
            const userEntity = event.user;

            const nodes = await this.nodesRepository.findConnectedNodes();

            if (nodes.length === 0) {
                throw new Error('No connected nodes found');
            }

            if (userEntity.activeUserInbounds.length === 0) {
                return;
            }

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

            // await pMap(
            //     nodes,
            //     async (node) => {
            //         await this.axios.addUser(userData, node.address, node.port);
            //     },
            //     { concurrency: this.CONCURRENCY },
            // );

            // const mapper = async site => {
            //     const {requestUrl} = await got.head(site);
            //     return requestUrl;
            // };

            // const result = await pMap(sites, mapper, {concurrency: 2});

            return;
        } catch (error) {
            this.logger.error(`Error in NodeCreatedHandler: ${JSON.stringify(error)}`);
        }
    }
}
