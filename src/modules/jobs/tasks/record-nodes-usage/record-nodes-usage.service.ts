import { GetAllOutboundsStatsCommand } from '@remnawave/node-contract';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import pMap from '@cjs-exporter/p-map';

import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { AxiosService } from '@common/axios';

import { UpsertHistoryEntryCommand } from '../../../nodes-usage-history/commands/upsert-history-entry/upsert-history-entry.command';
import { NodesUsageHistoryEntity } from '../../../nodes-usage-history/entities/nodes-usage-history.entity';
import { GetOnlineNodesQuery } from '../../../nodes/queries/get-online-nodes/get-online-nodes.query';
import { IncrementUsedTrafficCommand } from '../../../nodes/commands/increment-used-traffic';
import { JOBS_INTERVALS } from '../../intervals';
import { NodesEntity } from '../../../nodes';

@Injectable()
export class RecordNodesUsageService {
    private static readonly CRON_NAME = 'recordNodesUsage';
    private readonly logger = new Logger(RecordNodesUsageService.name);
    private isJobRunning: boolean;
    private cronName: string;
    private CONCURRENCY: number;
    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly axios: AxiosService,
    ) {
        this.isJobRunning = false;
        this.cronName = RecordNodesUsageService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.RECORD_NODE_USAGE, {
        name: RecordNodesUsageService.CRON_NAME,
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
                const response = await this.axios.getAllOutboundStats(
                    {
                        reset: true,
                    },
                    node.address,
                    node.port,
                );
                switch (response.isOk) {
                    case true:
                        return this.handleOk(node, response.response!);
                }
            };

            await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

            this.logger.debug(`Node usage history recorded. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(error);
        } finally {
            this.isJobRunning = false;
        }
    }

    private async handleOk(node: NodesEntity, response: GetAllOutboundsStatsCommand.Response) {
        let totalBytes = 0;
        let totalDownlink = 0;
        let totalUplink = 0;

        for (const outbound of response.response.outbounds) {
            totalDownlink += outbound.downlink;
            totalUplink += outbound.uplink;
        }

        if (totalDownlink === 0 && totalUplink === 0) {
            return;
        }

        totalBytes = totalDownlink + totalUplink;

        await this.reportUsageHistory({
            nodeUsageHistory: new NodesUsageHistoryEntity({
                nodeUuid: node.uuid,
                totalBytes: BigInt(totalBytes),
                uploadBytes: BigInt(totalUplink),
                downloadBytes: BigInt(totalDownlink),
                createdAt: new Date(),
            }),
        });

        await this.incrementUsedTraffic({
            nodeUuid: node.uuid,
            bytes: BigInt(totalBytes),
        });
    }

    private async getOnlineNodes(): Promise<ICommandResponse<NodesEntity[]>> {
        return this.queryBus.execute<GetOnlineNodesQuery, ICommandResponse<NodesEntity[]>>(
            new GetOnlineNodesQuery(),
        );
    }

    private async reportUsageHistory(
        dto: UpsertHistoryEntryCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<UpsertHistoryEntryCommand, ICommandResponse<void>>(
            new UpsertHistoryEntryCommand(dto.nodeUsageHistory),
        );
    }

    private async incrementUsedTraffic(
        dto: IncrementUsedTrafficCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<IncrementUsedTrafficCommand, ICommandResponse<void>>(
            new IncrementUsedTrafficCommand(dto.nodeUuid, dto.bytes),
        );
    }
}
