import { GetUsersStatsCommand } from '@remnawave/node-contract';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import pMap from '@cjs-exporter/p-map';

import { UpdateNodeCommand } from '@modules/nodes/commands/update-node/update-node.command';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { AxiosService } from '@common/axios';

import { IncrementUsedTrafficCommand } from '../../../users/commands/increment-used-traffic/increment-used-traffic.command';
import { NodesUserUsageHistoryEntity } from '../../../nodes-user-usage-history/entities/nodes-user-usage-history.entity';
import { UpsertUserHistoryEntryCommand } from '../../../nodes-user-usage-history/commands/upsert-user-history-entry';
import { GetUserByUsernameQuery } from '../../../users/queries/get-user-by-username/get-user-by-username.query';
import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';
import { GetOnlineNodesQuery } from '../../../nodes/queries/get-online-nodes/get-online-nodes.query';
import { JOBS_INTERVALS } from '../../intervals';
import { NodesEntity } from '../../../nodes';

@Injectable()
export class RecordUserUsageService {
    private static readonly CRON_NAME = 'recordUserUsage';
    private readonly logger = new Logger(RecordUserUsageService.name);
    private isJobRunning: boolean;
    private cronName: string;
    private CONCURRENCY: number;
    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly axios: AxiosService,
        private readonly eventBus: EventBus,
    ) {
        this.isJobRunning = false;
        this.cronName = RecordUserUsageService.CRON_NAME;
        this.CONCURRENCY = 20;
    }

    private checkJobRunning(): boolean {
        if (this.isJobRunning) {
            this.logger.log(
                `Job ${this.cronName} is already running. Will retry at ${this.schedulerRegistry.getCronJob(this.cronName).nextDate().toISOTime()}`,
            );
            return false;
        }
        return true;
    }

    @Cron(JOBS_INTERVALS.RECORD_USER_USAGE, {
        name: RecordUserUsageService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const nodesResponse = await this.getOnlineNodes();
            if (!nodesResponse.isOk || !nodesResponse.response) {
                this.logger.error('No connected nodes found');
                return;
            }

            const nodes = nodesResponse.response;

            const mapper = async (node: NodesEntity) => {
                const response = await this.axios.getUsersStats(
                    {
                        reset: true,
                    },
                    node.address,
                    node.port,
                );

                switch (response.isOk) {
                    case true:
                        return await this.handleOk(node, response.response!);
                }
            };

            await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

            this.logger.debug(`User usage history recorded. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(`Error in RecordUserUsageService: ${error}`);
        } finally {
            this.isJobRunning = false;
        }
    }

    private async handleOk(node: NodesEntity, response: GetUsersStatsCommand.Response) {
        let totalBytes = 0;
        let totalDownlink = 0;
        let totalUplink = 0;
        let usersOnline = 0;

        for (const xrayUser of response.response.users) {
            this.logger.log(`${JSON.stringify(xrayUser)}, node: ${node.name}`);
            totalDownlink += xrayUser.downlink;
            totalUplink += xrayUser.uplink;

            if (totalDownlink === 0 && totalUplink === 0) {
                continue;
            }

            usersOnline++;

            const userResponse = await this.getUserByUsername(xrayUser.username);
            if (!userResponse.isOk || !userResponse.response) {
                this.logger.error(`User ${xrayUser.username} not found`);
                continue;
            }

            const user = userResponse.response;

            totalBytes = totalDownlink + totalUplink;

            await this.reportUserUsageHistory({
                userUsageHistory: new NodesUserUsageHistoryEntity({
                    nodeUuid: node.uuid,
                    userUuid: user.uuid,
                    totalBytes: BigInt(totalBytes),
                    uploadBytes: BigInt(totalUplink),
                    downloadBytes: BigInt(totalDownlink),
                    createdAt: new Date(),
                }),
            });

            await this.incrementUsedTraffic({
                userUuid: user.uuid,
                bytes: BigInt(totalBytes),
            });
            this.logger.log(
                `Updated user ${user.username} traffic, ${totalBytes} bytes, node: ${node.name}`,
            );

            await this.updateNode({
                node: {
                    uuid: node.uuid,
                    usersOnline,
                },
            });
        }

        this.logger.log(`Total ${JSON.stringify(response.response.users)}, node: ${node.name}`);

        this.logger.log(`Total bytes: ${totalBytes}, node: ${node.name}`);

        this.logger.log(`Total users online: ${usersOnline}, node: ${node.name}`);
    }

    private async getOnlineNodes(): Promise<ICommandResponse<NodesEntity[]>> {
        return this.queryBus.execute<GetOnlineNodesQuery, ICommandResponse<NodesEntity[]>>(
            new GetOnlineNodesQuery(),
        );
    }

    private async getUserByUsername(
        username: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        return this.queryBus.execute<
            GetUserByUsernameQuery,
            ICommandResponse<UserWithActiveInboundsEntity>
        >(new GetUserByUsernameQuery(username));
    }

    private async reportUserUsageHistory(
        dto: UpsertUserHistoryEntryCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<UpsertUserHistoryEntryCommand, ICommandResponse<void>>(
            new UpsertUserHistoryEntryCommand(dto.userUsageHistory),
        );
    }

    private async incrementUsedTraffic(
        dto: IncrementUsedTrafficCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<IncrementUsedTrafficCommand, ICommandResponse<void>>(
            new IncrementUsedTrafficCommand(dto.userUuid, dto.bytes),
        );
    }

    private async updateNode(dto: UpdateNodeCommand): Promise<ICommandResponse<NodesEntity>> {
        return this.commandBus.execute<UpdateNodeCommand, ICommandResponse<NodesEntity>>(
            new UpdateNodeCommand(dto.node),
        );
    }
}
