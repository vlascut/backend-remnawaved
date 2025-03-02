import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';
import { EVENTS, RESET_PERIODS, USERS_STATUS } from '@libs/contracts/constants';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { JOBS_INTERVALS } from 'src/jobs/intervals';
import { AddUserToNodeEvent } from '@modules/nodes/events/add-user-to-node';
import { UserTrafficHistoryEntity } from '@modules/user-traffic-history/entities/user-traffic-history.entity';
import { UserWithActiveInboundsEntity } from '@modules/users/entities/user-with-active-inbounds.entity';
import { UpdateStatusAndTrafficAndResetAtCommand } from '@modules/users/commands/update-status-and-traffic-and-reset-at';
import { CreateUserTrafficHistoryCommand } from '@modules/user-traffic-history/commands/create-user-traffic-history';
import { GetUsersByTrafficStrategyAndStatusQuery } from '@modules/users/queries/get-users-by-traffic-strategy-and-status';
import { BatchResetUserTrafficCommand } from '@modules/users/commands/batch-reset-user-traffic';

@Injectable()
export class ResetUserTrafficCalendarMonthService {
    private static readonly CRON_NAME = 'resetUserTrafficCalendarMonth';
    private readonly logger = new Logger(ResetUserTrafficCalendarMonthService.name);
    private isJobRunning: boolean;
    private cronName: string;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.isJobRunning = false;
        this.cronName = ResetUserTrafficCalendarMonthService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.RESET_USER_TRAFFIC.MONTHLY, {
        name: ResetUserTrafficCalendarMonthService.CRON_NAME,
    })
    async handleCron() {
        let users: UserWithActiveInboundsEntity[] | null = null;

        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const batchResetResponse = await this.batchResetUserTraffic({
                strategy: RESET_PERIODS.MONTH,
            });

            if (!batchResetResponse.isOk) {
                this.logger.debug('No users found for Batch Reset Monthly Users Traffic.');
            } else {
                this.logger.debug(
                    `Batch Reset Monthly Users Traffic. Time: ${formatExecutionTime(ct)}`,
                );
            }

            const usersResponse = await this.getAllUsers({
                strategy: RESET_PERIODS.MONTH,
                status: USERS_STATUS.LIMITED,
            });

            if (!usersResponse.isOk || !usersResponse.response) {
                this.logger.debug('No users found');
                return;
            }

            const users = usersResponse.response;

            for (const user of users) {
                let status = undefined;

                status = USERS_STATUS.ACTIVE;
                user.status = status;

                this.eventEmitter.emit(
                    EVENTS.USER.ENABLED,
                    new UserEvent(user, EVENTS.USER.ENABLED),
                );

                this.eventBus.publish(new AddUserToNodeEvent(user));

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

            this.logger.debug(`Reseted Monthly Users Traffic. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(`Error in ResetUserMonthlyTrafficService: ${error}`);
        } finally {
            users = null;
            this.isJobRunning = false;
        }
    }

    private async getAllUsers(
        dto: GetUsersByTrafficStrategyAndStatusQuery,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity[]>> {
        return this.queryBus.execute<
            GetUsersByTrafficStrategyAndStatusQuery,
            ICommandResponse<UserWithActiveInboundsEntity[]>
        >(new GetUsersByTrafficStrategyAndStatusQuery(dto.strategy, dto.status));
    }

    private async updateUserStatusAndTrafficAndResetAt(
        dto: UpdateStatusAndTrafficAndResetAtCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<
            UpdateStatusAndTrafficAndResetAtCommand,
            ICommandResponse<void>
        >(new UpdateStatusAndTrafficAndResetAtCommand(dto.userUuid, dto.lastResetAt, dto.status));
    }

    private async batchResetUserTraffic(
        dto: BatchResetUserTrafficCommand,
    ): Promise<ICommandResponse<{ affectedRows: number }>> {
        return this.commandBus.execute<
            BatchResetUserTrafficCommand,
            ICommandResponse<{
                affectedRows: number;
            }>
        >(new BatchResetUserTrafficCommand(dto.strategy));
    }

    private async createUserUsageHistory(
        dto: CreateUserTrafficHistoryCommand,
    ): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<CreateUserTrafficHistoryCommand, ICommandResponse<void>>(
            new CreateUserTrafficHistoryCommand(dto.userTrafficHistory),
        );
    }
}
