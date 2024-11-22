import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';
import { JOBS_INTERVALS } from '../../intervals';
import { GetAllUsersQuery } from '../../../users/queries/get-all-users/get-all-users.query';
import { RESET_PERIODS, TResetPeriods, USERS_STATUS } from '../../../../../libs/contract';
import dayjs from 'dayjs';
import { UpdateStatusAndTrafficAndResetAtCommand } from '../../../users/commands/update-status-and-traffic-and-reset-at/update-status-and-traffic-and-reset-at.command';
import { AddUserToNodeEvent } from '../../../nodes/events/add-user-to-node';
import { CreateUserTrafficHistoryCommand } from '../../../user-traffic-history/commands/create-user-traffic-history/create-user-traffic-history.command';
import { UserTrafficHistoryEntity } from '../../../user-traffic-history';

@Injectable()
export class ResetUserTrafficService {
    private static readonly CRON_NAME = 'resetUserTraffic';
    private readonly logger = new Logger(ResetUserTrafficService.name);
    private isJobRunning: boolean;
    private cronName: string;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {
        this.isJobRunning = false;
        this.cronName = ResetUserTrafficService.CRON_NAME;
    }

    private checkJobRunning(): boolean {
        if (this.isJobRunning) {
            this.logger.debug(
                `Job ${this.cronName} is already running. Will retry at ${this.schedulerRegistry.getCronJob(this.cronName).nextDate().toISOTime()}`,
            );
            return false;
        }
        return true;
    }

    @Cron(JOBS_INTERVALS.RESET_USER_TRAFFIC, {
        name: ResetUserTrafficService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const usersResponse = await this.getAllUsers();
            if (!usersResponse.isOk || !usersResponse.response) {
                this.logger.error('No users found');
                return;
            }

            const users = usersResponse.response;

            for (const user of users) {
                if (user.trafficLimitStrategy === RESET_PERIODS.NO_RESET) continue;

                const days = this.enumToDays(user.trafficLimitStrategy);
                const lastResetDate = dayjs(user.lastTrafficResetAt ?? user.createdAt);
                const currentDate = dayjs();

                const daysSinceLastReset = currentDate.diff(lastResetDate, 'day');

                if (daysSinceLastReset < days) continue;

                let status = undefined;

                if (user.status === USERS_STATUS.LIMITED) {
                    status = USERS_STATUS.ACTIVE;
                    this.eventBus.publish(new AddUserToNodeEvent(user));
                }

                await this.updateUserStatusAndTrafficAndResetAt({
                    userUuid: user.uuid,
                    lastResetAt: new Date(),
                    status,
                });

                await this.createUserUsageHistory({
                    userTrafficHistory: new UserTrafficHistoryEntity({
                        userUuid: user.uuid,
                        resetAt: new Date(),
                        usedBytes: BigInt(user.usedTrafficBytes),
                    }),
                });
            }

            this.logger.debug(`Reseted user traffic. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(error);
        } finally {
            this.isJobRunning = false;
        }
    }

    private enumToDays(period: TResetPeriods): number {
        switch (period) {
            case RESET_PERIODS.DAY:
                return 1;
            case RESET_PERIODS.WEEK:
                return 7;
            case RESET_PERIODS.MONTH:
                return 30;
            case RESET_PERIODS.YEAR:
                return 365;
            case RESET_PERIODS.NO_RESET:
                return 0;
        }
    }
    private async getAllUsers(): Promise<ICommandResponse<UserWithActiveInboundsEntity[]>> {
        return this.queryBus.execute<
            GetAllUsersQuery,
            ICommandResponse<UserWithActiveInboundsEntity[]>
        >(new GetAllUsersQuery());
    }

    private async updateUserStatusAndTrafficAndResetAt(
        dto: UpdateStatusAndTrafficAndResetAtCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<
            UpdateStatusAndTrafficAndResetAtCommand,
            ICommandResponse<void>
        >(new UpdateStatusAndTrafficAndResetAtCommand(dto.userUuid, dto.lastResetAt, dto.status));
    }

    private async createUserUsageHistory(
        dto: CreateUserTrafficHistoryCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<CreateUserTrafficHistoryCommand, ICommandResponse<void>>(
            new CreateUserTrafficHistoryCommand(dto.userTrafficHistory),
        );
    }
}
