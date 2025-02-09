import { GetUsersStatsCommand } from '@remnawave/node-contract';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import pMap from '@cjs-exporter/p-map';
import { Gauge } from 'prom-client';

import { IncrementUsedTrafficCommand } from '@modules/users/commands/increment-used-traffic/increment-used-traffic.command';
import { NodesUserUsageHistoryEntity } from '@modules/nodes-user-usage-history/entities/nodes-user-usage-history.entity';
import { UpsertUserHistoryEntryCommand } from '@modules/nodes-user-usage-history/commands/upsert-user-history-entry';
import { GetUserByUsernameQuery } from '@modules/users/queries/get-user-by-username/get-user-by-username.query';
import { GetOnlineNodesQuery } from '@modules/nodes/queries/get-online-nodes/get-online-nodes.query';
import { UpdateNodeCommand } from '@modules/nodes/commands/update-node/update-node.command';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { UserWithActiveInboundsEntity } from '@modules/users/entities';
import { ICommandResponse } from '@common/types/command-response.type';
import { AxiosService } from '@common/axios';
import { NodesEntity } from '@modules/nodes';

import { JOBS_INTERVALS } from '../../intervals';
import { METRIC_NAMES } from '@libs/contracts/constants';
import { resolveCountryEmoji } from '@common/utils/resolve-country-emoji';

@Injectable()
export class RecordUserUsageService {
    private static readonly CRON_NAME = 'recordUserUsage';
    private readonly logger = new Logger(RecordUserUsageService.name);
    private isJobRunning: boolean;
    private cronName: string;
    private CONCURRENCY: number;
    constructor(
        @InjectMetric(METRIC_NAMES.NODE_ONLINE_USERS) public nodeOnlineUsers: Gauge<string>,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly axios: AxiosService,
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
                    case false:
                        this.logger.error(`Can't get users stats, node: ${node.name}`);
                        return;
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
        let usersOnline = 0;

        for (const xrayUser of response.response.users) {
            const totalDownlink = xrayUser.downlink;
            const totalUplink = xrayUser.uplink;

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

            const totalBytes = totalDownlink + totalUplink;

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
        }

        await this.updateNode({
            node: {
                uuid: node.uuid,
                usersOnline,
            },
        });

        this.nodeOnlineUsers.set(
            {
                node_uuid: node.uuid,
                node_name: node.name,
                node_country_emoji: resolveCountryEmoji(node.countryCode),
            },
            usersOnline,
        );
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
