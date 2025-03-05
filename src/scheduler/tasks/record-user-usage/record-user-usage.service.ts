import { InjectMetric } from '@willsoto/nestjs-prometheus';
import pMap from '@cjs-exporter/p-map';
import { Gauge } from 'prom-client';

import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';

import { GetUsersStatsCommand } from '@remnawave/node-contract';

import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { resolveCountryEmoji } from '@common/utils/resolve-country-emoji';
import { ICommandResponse } from '@common/types/command-response.type';
import { fromNanoToNumber } from '@common/utils/nano';
import { AxiosService } from '@common/axios';
import { METRIC_NAMES } from '@libs/contracts/constants';

import { BulkUpsertUserHistoryEntryCommand } from '@modules/nodes-user-usage-history/commands/bulk-upsert-user-history-entry';
import { BulkIncrementUsedTrafficCommand } from '@modules/users/commands/bulk-increment-used-traffic';
import { NodesUserUsageHistoryEntity } from '@modules/nodes-user-usage-history/entities';
import { GetUserByUsernameQuery } from '@modules/users/queries/get-user-by-username';
import { GetOnlineNodesQuery } from '@modules/nodes/queries/get-online-nodes';
import { UpdateNodeCommand } from '@modules/nodes/commands/update-node';
import { UserWithActiveInboundsEntity } from '@modules/users/entities';
import { NodesEntity } from '@modules/nodes';

import { JOBS_INTERVALS } from '../../intervals';

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
        let nodes: NodesEntity[] | null = null;

        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const nodesResponse = await this.getOnlineNodes();
            if (!nodesResponse.isOk || !nodesResponse.response) {
                this.logger.debug('No connected nodes found.');
                return;
            }

            nodes = nodesResponse.response;

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
            nodes = null;
        }
    }

    private async handleOk(node: NodesEntity, response: GetUsersStatsCommand.Response) {
        let usersOnline = 0;
        let users = response.response.users.filter((user) => {
            if (user.username.startsWith('http')) {
                this.logger.debug(`Skipping user with https:// or http:// in username`);
                return false;
            }
            if (user.downlink === 0 && user.uplink === 0) {
                return false;
            }
            usersOnline++;
            return true;
        });

        let allUsageRecords: NodesUserUsageHistoryEntity[] = [];
        let userUsageList: { userUuid: string; bytes: bigint }[] = [];

        if (users.length > 0) {
            await pMap(
                users,
                async (xrayUser) => {
                    const userResponse = await this.getUserByUsername(xrayUser.username);
                    if (!userResponse.isOk || !userResponse.response) {
                        this.logger.error(
                            `Username ${xrayUser.username} from XTLS-Core not found in database, node: ${node.name}`,
                        );
                        return;
                    }

                    const user = userResponse.response;
                    const totalBytes = xrayUser.downlink + xrayUser.uplink;

                    allUsageRecords.push(
                        new NodesUserUsageHistoryEntity({
                            nodeUuid: node.uuid,
                            userUuid: user.uuid,
                            totalBytes: BigInt(totalBytes),
                            uploadBytes: BigInt(xrayUser.uplink),
                            downloadBytes: BigInt(xrayUser.downlink),
                        }),
                    );

                    userUsageList.push({
                        userUuid: user.uuid,
                        bytes: this.multiplyConsumption(node, totalBytes),
                    });
                },
                { concurrency: 40 },
            );

            await this.reportBulkUserUsageHistory({
                userUsageHistoryList: allUsageRecords,
            });

            await this.bulkIncrementUsedTraffic({
                userUsageList,
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

        allUsageRecords = [];
        userUsageList = [];
        users = [];

        return;
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

    private async reportBulkUserUsageHistory(
        dto: BulkUpsertUserHistoryEntryCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<BulkUpsertUserHistoryEntryCommand, ICommandResponse<void>>(
            new BulkUpsertUserHistoryEntryCommand(dto.userUsageHistoryList),
        );
    }

    private async bulkIncrementUsedTraffic(
        dto: BulkIncrementUsedTrafficCommand,
    ): Promise<ICommandResponse<number>> {
        return this.commandBus.execute<BulkIncrementUsedTrafficCommand, ICommandResponse<number>>(
            new BulkIncrementUsedTrafficCommand(dto.userUsageList),
        );
    }

    private async updateNode(dto: UpdateNodeCommand): Promise<ICommandResponse<NodesEntity>> {
        return this.commandBus.execute<UpdateNodeCommand, ICommandResponse<NodesEntity>>(
            new UpdateNodeCommand(dto.node),
        );
    }

    private multiplyConsumption(node: NodesEntity, totalBytes: number): bigint {
        if (node.consumptionMultiplier === BigInt(1000000000)) {
            // skip if 1:1 ratio
            return BigInt(totalBytes);
        }

        return BigInt(Math.floor(fromNanoToNumber(node.consumptionMultiplier) * totalBytes));
    }
}
