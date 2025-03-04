import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { IXrayConfig } from '@common/helpers/xray-config/interfaces';
import { AxiosService } from '@common/axios';
import { EVENTS } from '@libs/contracts/constants';

import { NodeEvent } from '@intergration-modules/telegram-bot/events/nodes/interfaces';

import { GetPreparedConfigWithUsersQuery } from '@modules/users/queries/get-prepared-config-with-users';
import { InboundsEntity } from '@modules/inbounds/entities';

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
            const nodeFromEvent = event.node;

            const nodeEntity = await this.nodesRepository.findByUUID(nodeFromEvent.uuid);

            if (!nodeEntity) {
                this.logger.error(`Node ${nodeFromEvent.uuid} not found`);
                return;
            }

            if (nodeEntity.isConnecting) {
                return;
            }

            await this.nodesRepository.update({
                uuid: nodeEntity.uuid,
                isConnecting: true,
            });

            const xrayStatusResponse = await this.axios.getNodeHealth(
                nodeEntity.address,
                nodeEntity.port,
            );

            if (!xrayStatusResponse.isOk) {
                await this.nodesRepository.update({
                    uuid: nodeEntity.uuid,
                    isXrayRunning: false,
                    isNodeOnline: false,
                    lastStatusMessage: xrayStatusResponse.message ?? null,
                    lastStatusChange: new Date(),
                    isConnected: false,
                    isConnecting: false,
                    usersOnline: 0,
                });

                return;
            }

            const startTime = Date.now();
            console.time('getConfigForNode');
            const config = await this.getConfigForNode(nodeEntity.excludedInbounds);
            console.timeEnd('getConfigForNode');

            console.log(config.response?.inbounds[0].settings?.clients.length);
            console.log(config.response?.inbounds[1]?.settings?.clients.length || 'null');
            console.log(config.response?.inbounds[2]?.settings?.clients.length || 'null');
            console.log(config.response?.inbounds[3]?.settings?.clients.length || 'null');
            console.log(config.response?.inbounds[4]?.settings?.clients.length || 'null');
            console.log(config.response?.inbounds[5]?.settings?.clients.length || 'null');

            this.logger.log(`Generated config for node in ${Date.now() - startTime}ms`);

            if (!config.isOk || !config.response) {
                throw new Error('Failed to get config for node');
            }

            const reqStartTime = Date.now();

            const res = await this.axios.startXray(
                config.response as unknown as Record<string, unknown>,
                nodeEntity.address,
                nodeEntity.port,
            );

            this.logger.log(`Started node in ${Date.now() - reqStartTime}ms`);

            if (!res.isOk || !res.response) {
                await this.nodesRepository.update({
                    uuid: nodeEntity.uuid,
                    isXrayRunning: false,
                    isNodeOnline: false,
                    lastStatusMessage: res.message ?? null,
                    lastStatusChange: new Date(),
                    isConnected: false,
                    isConnecting: false,
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
                isConnecting: false,
                cpuCount: nodeResponse.systemInformation?.cpuCores ?? null,
                cpuModel: nodeResponse.systemInformation?.cpuModel ?? null,
                totalRam: nodeResponse.systemInformation?.memoryTotal ?? null,
                usersOnline: 0,
            });

            if (!nodeEntity.isConnected) {
                this.eventEmitter.emit(
                    EVENTS.NODE.CONNECTION_RESTORED,
                    new NodeEvent(node, EVENTS.NODE.CONNECTION_RESTORED),
                );
            }

            return;
        } catch (error) {
            this.logger.error(`Error in Event StartNodeHandler: ${error}`);
        }
    }

    private getConfigForNode(
        excludedInbounds: InboundsEntity[],
    ): Promise<ICommandResponse<IXrayConfig>> {
        return this.queryBus.execute<
            GetPreparedConfigWithUsersQuery,
            ICommandResponse<IXrayConfig>
        >(new GetPreparedConfigWithUsersQuery(excludedInbounds));
    }
}
