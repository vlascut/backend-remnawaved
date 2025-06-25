import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { RemoveUserCommand as RemoveUserFromNodeCommandSdk } from '@remnawave/node-contract/build/commands';

import { GetUserWithResolvedInboundsQuery } from '@modules/users/queries/get-user-with-resolved-inbounds/get-user-with-resolved-inbounds.query';

import { NodeUsersQueueService } from '@queue/node-users/node-users.service';

import { RemoveUserFromNodeEvent } from './remove-user-from-node.event';
import { NodesRepository } from '../../repositories/nodes.repository';

@EventsHandler(RemoveUserFromNodeEvent)
export class RemoveUserFromNodeHandler implements IEventHandler<RemoveUserFromNodeEvent> {
    public readonly logger = new Logger(RemoveUserFromNodeHandler.name);

    constructor(
        private readonly nodesRepository: NodesRepository,
        private readonly nodeUsersQueue: NodeUsersQueueService,
        private readonly queryBus: QueryBus,
    ) {}
    async handle(event: RemoveUserFromNodeEvent) {
        try {
            // TODO: need refactor

            const userEntity = await this.queryBus.execute(
                new GetUserWithResolvedInboundsQuery(event.userUuid),
            );

            if (!userEntity.isOk || !userEntity.response) {
                return;
            }

            const { username, inbounds } = userEntity.response;

            if (inbounds.length === 0) {
                return;
            }

            const nodes = await this.nodesRepository.findConnectedNodes();

            if (nodes.length === 0) {
                return;
            }

            const userData: RemoveUserFromNodeCommandSdk.Request = {
                username,
            };

            await this.nodeUsersQueue.removeUserFromNodeBulk(
                nodes.map((node) => ({
                    data: userData,
                    node: {
                        address: node.address,
                        port: node.port,
                    },
                })),
            );

            return;
        } catch (error) {
            this.logger.error(`Error in Event RemoveUserFromNodeHandler: ${error}`);
        }
    }
}
