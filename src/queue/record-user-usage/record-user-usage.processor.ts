import pMap from '@cjs-exporter/p-map';
import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { GetUsersStatsCommand } from '@remnawave/node-contract';

import { ICommandResponse } from '@common/types/command-response.type';
import { fromNanoToNumber } from '@common/utils/nano';
import { AxiosService } from '@common/axios';

import { BulkUpsertUserHistoryEntryCommand } from '@modules/nodes-user-usage-history/commands/bulk-upsert-user-history-entry';
import { BulkIncrementUsedTrafficCommand } from '@modules/users/commands/bulk-increment-used-traffic';
import { NodesUserUsageHistoryEntity } from '@modules/nodes-user-usage-history/entities';
import { GetUserByUsernameQuery } from '@modules/users/queries/get-user-by-username';
import { UpdateNodeCommand } from '@modules/nodes/commands/update-node';
import { UserWithActiveInboundsEntity } from '@modules/users/entities';
import { NodesEntity } from '@modules/nodes';

import { RecordUserUsagePayload } from './interfaces';
import { RecordUserUsageJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(QueueNames.recordUserUsage, {
    concurrency: 100,
})
export class RecordUserUsageQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(RecordUserUsageQueueProcessor.name);

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly axios: AxiosService,
    ) {
        super();
    }

    async process(job: Job<RecordUserUsagePayload>) {
        try {
            const { nodeUuid, nodeAddress, nodePort, consumptionMultiplier } = job.data;

            const response = await this.axios.getUsersStats(
                {
                    reset: true,
                },
                nodeAddress,
                nodePort,
            );

            switch (response.isOk) {
                case true:
                    return await this.handleOk(nodeUuid, response.response!, consumptionMultiplier);
                case false:
                    this.logger.error(`Can't get users stats, node: ${nodeUuid}`);
                    return;
            }
        } catch (error) {
            this.logger.error(
                `Error handling "${RecordUserUsageJobNames.recordUserUsage}" job: ${error}`,
            );
        }
    }

    private async handleOk(
        nodeUuid: string,
        response: GetUsersStatsCommand.Response,
        consumptionMultiplier: string,
    ) {
        let usersOnline = 0;

        // TODO: Debug for docker

        this.logger.log(`Response: ${JSON.stringify(response.response)}`);

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

        this.logger.log(`Users: ${JSON.stringify(users)}`);

        if (users.length > 0) {
            await pMap(
                users,
                async (xrayUser) => {
                    const userResponse = await this.getUserByUsername(xrayUser.username);
                    if (!userResponse.isOk || !userResponse.response) {
                        return;
                    }

                    const { uuid: userUuid } = userResponse.response;
                    const totalBytes = xrayUser.downlink + xrayUser.uplink;

                    this.logger.log(`User: ${JSON.stringify(xrayUser)}`);

                    allUsageRecords.push(
                        new NodesUserUsageHistoryEntity({
                            nodeUuid,
                            userUuid,
                            totalBytes: BigInt(totalBytes),
                            uploadBytes: BigInt(xrayUser.uplink),
                            downloadBytes: BigInt(xrayUser.downlink),
                        }),
                    );

                    userUsageList.push({
                        userUuid,
                        bytes: this.multiplyConsumption(consumptionMultiplier, totalBytes),
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
                uuid: nodeUuid,
                usersOnline,
            },
        });

        allUsageRecords = [];
        userUsageList = [];
        users = [];

        return;
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

    private multiplyConsumption(consumptionMultiplier: string, totalBytes: number): bigint {
        const consumptionMultiplierNumber = BigInt(consumptionMultiplier);
        if (consumptionMultiplierNumber === BigInt(1000000000)) {
            // skip if 1:1 ratio
            return BigInt(totalBytes);
        }

        return BigInt(Math.floor(fromNanoToNumber(consumptionMultiplierNumber) * totalBytes));
    }
}
