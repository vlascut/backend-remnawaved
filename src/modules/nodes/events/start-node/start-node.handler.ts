import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { NodeEvent } from '@intergration-modules/telegram-bot/events/nodes/interfaces';
import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { EVENTS } from '@libs/contracts/constants';
import { AxiosService } from '@common/axios';

import { GetPreparedConfigWithUsersQuery } from '../../../xray-config/queries/get-prepared-config-with-users';
import { NodesRepository } from '../../repositories/nodes.repository';
import { StartNodeEvent } from './start-node.event';

@EventsHandler(StartNodeEvent)
export class StartNodeHandler implements IEventHandler<StartNodeEvent> {
    public readonly logger = new Logger(StartNodeHandler.name);

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
        private readonly queryBus: QueryBus,
        private readonly eventEmitter: EventEmitter2,
    ) {}
    async handle(event: StartNodeEvent) {
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
                await this.nodesRepository.update({
                    uuid: nodeEntity.uuid,
                    isXrayRunning: false,
                    isNodeOnline: false,
                    lastStatusMessage: res.message ?? null,
                    lastStatusChange: new Date(),
                    isConnected: false,
                    isConnecting: false,
                    isDisabled: false,
                    usersOnline: 0,
                });
                return;
            }

            const nodeResponse = res.response.response;

            const node = await this.nodesRepository.update({
                uuid: nodeEntity.uuid,
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
                usersOnline: 0,
            });

            if (!nodeEntity.isConnected) {
                this.eventEmitter.emit(EVENTS.NODE.CONNECTION_RESTORED, new NodeEvent(node));
            }

            return;
        } catch (error) {
            this.logger.error(`Error in Event StartNodeHandler: ${error}`);
        }
    }

    private getConfigForNode(): Promise<ICommandResponse<IXrayConfig>> {
        return this.queryBus.execute<
            GetPreparedConfigWithUsersQuery,
            ICommandResponse<IXrayConfig>
        >(new GetPreparedConfigWithUsersQuery());
    }
}
