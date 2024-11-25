import { Injectable, Logger } from '@nestjs/common';
import { ERRORS } from '@contract/constants';
import * as si from 'systeminformation';
import { ICommandResponse } from '@common/types/command-response.type';
import { GetShortUserStatsQuery } from '../users/queries/get-short-user-stats';
import { UserStats } from '../users/interfaces/user-stats.interface';
import { QueryBus } from '@nestjs/cqrs';
import { GetStatsResponseModel } from './models/get-stats.response.model';

@Injectable()
export class SystemService {
    private readonly logger = new Logger(SystemService.name);
    constructor(private readonly queryBus: QueryBus) {}

    async getStats(): Promise<ICommandResponse<any>> {
        try {
            const userStats = await this.getShortUserStats();

            if (!userStats.isOk || !userStats.response) {
                return {
                    isOk: false,
                    ...ERRORS.GET_USER_STATS_ERROR,
                };
            }

            const [cpu, mem, time] = await Promise.all([si.cpu(), si.mem(), si.time()]);

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
}
