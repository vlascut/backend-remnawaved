import { Injectable, Logger } from '@nestjs/common';
import { ERRORS } from '@contract/constants';
import * as si from 'systeminformation';
import { ICommandResponse } from '@common/types/command-response.type';
import { GetShortUserStatsQuery } from '../users/queries/get-short-user-stats';
import { UserStats } from '../users/interfaces/user-stats.interface';
import { QueryBus } from '@nestjs/cqrs';
import { GetStatsResponseModel } from './models/get-stats.response.model';
import { GetStatsRequestQueryDto } from './dtos/get-stats.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { GetSumByDtRangeQuery } from '../nodes-usage-history/queries/get-sum-by-dt-range';
import { getDateRange } from '@common/utils/get-date-ranges.uti';
import { calcPercentDiff } from '@common/utils/calc-percent-diff.util';
import { prettyBytesUtil } from '@common/utils/bytes';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class SystemService {
    private readonly logger = new Logger(SystemService.name);
    constructor(private readonly queryBus: QueryBus) {}

    async getStats(query: GetStatsRequestQueryDto): Promise<ICommandResponse<any>> {
        try {
            const userStats = await this.getShortUserStats();

            if (!userStats.isOk || !userStats.response) {
                return {
                    isOk: false,
                    ...ERRORS.GET_USER_STATS_ERROR,
                };
            }

            const [cpu, mem, time] = await Promise.all([si.cpu(), si.mem(), si.time()]);

            const rangeStats = await this.getRangeStats(query.tz);

            return {
                isOk: true,
                response: new GetStatsResponseModel({
                    cpu: {
                        cores: cpu.cores,
                        physicalCores: cpu.physicalCores,
                    },
                    memory: {
                        total: mem.total,
                        free: mem.free,
                        used: mem.used,
                        active: mem.active,
                        available: mem.available,
                    },
                    uptime: time.uptime,
                    timestamp: Date.now(),
                    users: userStats.response,
                    stats: {
                        nodesUsageLastTwoDays: rangeStats,
                    },
                }),
            };
        } catch (error) {
            this.logger.error('Error getting system stats:', error);
            throw error;
        }
    }

    private async getShortUserStats(): Promise<ICommandResponse<UserStats>> {
        return this.queryBus.execute<GetShortUserStatsQuery, ICommandResponse<UserStats>>(
            new GetShortUserStatsQuery(),
        );
    }

    private async getNodesUsageByDtRange(
        query: GetSumByDtRangeQuery,
    ): Promise<ICommandResponse<bigint>> {
        return this.queryBus.execute<GetSumByDtRangeQuery, ICommandResponse<bigint>>(
            new GetSumByDtRangeQuery(query.start, query.end),
        );
    }

    private async getRangeStats(
        timezone: string | undefined,
    ): Promise<{ current: string; previous: string; percentage: number }> {
        let tz = 'UTC';
        if (timezone) {
            tz = timezone;
        }

        const [todayStartDate, todayEndDate] = getDateRange(tz);
        const nodesUsageToday = await this.getNodesUsageByDtRange({
            start: todayStartDate,
            end: todayEndDate,
        });

        const [yesterdayStartDate, yesterdayEndDate] = getDateRange(tz, 1);
        const nodesUsageYesterday = await this.getNodesUsageByDtRange({
            start: yesterdayStartDate,
            end: yesterdayEndDate,
        });

        const currentUsage = nodesUsageToday.response || 0;
        const previousUsage = nodesUsageYesterday.response || 0;

        const [cur, prev, perc] = calcPercentDiff(currentUsage, previousUsage);

        return {
            current: prettyBytesUtil(cur),
            previous: prettyBytesUtil(prev),
            percentage: perc,
        };
    }
}
