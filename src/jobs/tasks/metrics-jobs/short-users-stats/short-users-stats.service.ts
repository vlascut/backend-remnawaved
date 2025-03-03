import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { METRIC_NAMES } from '@libs/contracts/constants';

import { GetShortUserStatsQuery } from '@modules/users/queries/get-short-user-stats/get-short-user-stats.query';
import { ShortUserStats } from '@modules/users/interfaces/user-stats.interface';

import { JOBS_INTERVALS } from '@jobs/intervals';

@Injectable()
export class ShortUsersStatsService {
    private static readonly CRON_NAME = 'shortUsersStats';
    private readonly logger = new Logger(ShortUsersStatsService.name);
    private isJobRunning: boolean;
    private cronName: string;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        @InjectMetric(METRIC_NAMES.USERS_STATUS) public usersStatus: Gauge<string>,
        @InjectMetric(METRIC_NAMES.USERS_TOTAL) public usersTotal: Gauge<string>,
        private readonly queryBus: QueryBus,
    ) {
        this.isJobRunning = false;
        this.cronName = ShortUsersStatsService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.METRIC_SHORT_USERS_STATS, {
        name: ShortUsersStatsService.CRON_NAME,
    })
    async handleCron() {
        let usersResponse: ICommandResponse<ShortUserStats> | null = null;

        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            usersResponse = await this.getShortUserStats();
            if (!usersResponse.isOk || !usersResponse.response) {
                this.logger.error('No active users found');
                return;
            }

            const stats = usersResponse.response;

            Object.entries(stats.statusCounts.statusCounts).forEach(([status, count]) => {
                this.usersStatus.set({ status }, count);
            });

            this.usersTotal.set({ type: 'all' }, stats.statusCounts.totalUsers);

            this.logger.debug(`Short users stats updated. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(`Error in ShortUsersStatsService: ${error}`);
        } finally {
            this.isJobRunning = false;
            usersResponse = null;
        }
    }

    private async getShortUserStats(): Promise<ICommandResponse<ShortUserStats>> {
        return this.queryBus.execute<GetShortUserStatsQuery, ICommandResponse<ShortUserStats>>(
            new GetShortUserStatsQuery(),
        );
    }
}
