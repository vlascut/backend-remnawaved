import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import {
    CipherType,
    RemoveUserCommand as RemoveUserFromNodeCommandSdk,
} from '@remnawave/node-contract/build/commands';
import { AddUserCommand as AddUserToNodeCommandSdk } from '@remnawave/node-contract/build/commands';

import { getVlessFlowFromDbInbound } from '@common/utils/flow/get-vless-flow';

import { NodeUsersQueueService } from '@queue/node-users/node-users.service';

import { NodesRepository } from '../../repositories/nodes.repository';
import { ReaddUserToNodeEvent } from './readd-user-to-node.event';

@EventsHandler(ReaddUserToNodeEvent)
export class ReaddUserToNodeHandler implements IEventHandler<ReaddUserToNodeEvent> {
    public readonly logger = new Logger(ReaddUserToNodeHandler.name);

    constructor(
        private readonly nodesRepository: NodesRepository,
        private readonly nodeUsersQueue: NodeUsersQueueService,
    ) {}
    async handle(event: ReaddUserToNodeEvent) {
        try {
            const userEntity = event.user;

            const nodes = await this.nodesRepository.findConnectedNodes();

            if (nodes.length === 0) {
                this.logger.debug('No connected nodes found');
                return;
            }

            let oldInboundTags: string[] = [];
            if (event.oldInboundTags === undefined) {
                oldInboundTags = event.user.activeUserInbounds.map((inbound) => inbound.tag);
            } else {
                oldInboundTags = event.oldInboundTags;
            }

            const removeUserData: RemoveUserFromNodeCommandSdk.Request = {
                username: userEntity.username,
                tags: oldInboundTags,
            };

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
                                flow: getVlessFlowFromDbInbound(inbound),
                                level: 0,
                                tag: inbound.tag,
                            };
                        case 'shadowsocks':
                            return {
                                type: inboundType,
                                username: userEntity.username,
                                password: userEntity.ssPassword,
                                level: 0,
                                tag: inbound.tag,
                                cipherType: CipherType.CHACHA20_POLY1305,
                                ivCheck: false,
                            };
                        default:
                            throw new Error(`Unsupported inbound type: ${inboundType}`);
                    }
                }),
            };

            for (const node of nodes) {
                const excludedTags = new Set(node.excludedInbounds.map((inbound) => inbound.tag));

                const filteredData: AddUserToNodeCommandSdk.Request = {
                    ...userData,
                    data: userData.data.filter((item) => !excludedTags.has(item.tag)),
                };

                await this.nodeUsersQueue.readdUserToNode({
                    removePayload: removeUserData,
                    addPayload: filteredData,
                    node: {
                        address: node.address,
                        port: node.port,
                    },
                });
            }

            return;
        } catch (error) {
            this.logger.error(`Error in Event ReaddUserToNodeHandler: ${error}`);
        }
    }
}
