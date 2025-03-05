import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS, RESET_PERIODS } from '@libs/contracts/constants';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';

import { BatchResetLimitedUsersTrafficCommand } from '@modules/users/commands/batch-reset-limited-users-traffic';
import { UserWithActiveInboundsEntity } from '@modules/users/entities/user-with-active-inbounds.entity';
import { BatchResetUserTrafficCommand } from '@modules/users/commands/batch-reset-user-traffic';
import { GetUserByUuidQuery } from '@modules/users/queries/get-user-by-uuid';
import { AddUserToNodeEvent } from '@modules/nodes/events/add-user-to-node';
import { StartAllNodesEvent } from '@modules/nodes/events/start-all-nodes';

import { JOBS_INTERVALS } from '.wip/jobs/intervals';

@Injectable()
export class ResetUserTrafficCalendarWeekService {
    private static readonly CRON_NAME = 'resetUserTrafficCalendarWeek';
    private readonly logger = new Logger(ResetUserTrafficCalendarWeekService.name);
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
        this.cronName = ResetUserTrafficCalendarWeekService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.RESET_USER_TRAFFIC.WEEKLY, {
        name: ResetUserTrafficCalendarWeekService.CRON_NAME,
    })
    async handleCron() {
        let users: { uuid: string }[] | null = null;

        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const batchResetResponse = await this.batchResetUserTraffic({
                strategy: RESET_PERIODS.WEEK,
            });

            if (!batchResetResponse.isOk) {
                this.logger.debug('No users found for Batch Reset Weekly Users Traffic.');
            } else {
                this.logger.debug(
                    `Batch Reset Weekly Users Traffic. Time: ${formatExecutionTime(ct)}`,
                );
            }

            const updatedUsersUuids = await this.batchResetLimitedUsersTraffic({
                strategy: RESET_PERIODS.WEEK,
            });

            if (!updatedUsersUuids.isOk || !updatedUsersUuids.response) {
                this.logger.debug('No users found');
                return;
            }

            const updatedUsers = updatedUsersUuids.response;

            if (updatedUsers.length === 0) {
                this.logger.debug('No expired users found');
                return;
            }

            users = updatedUsersUuids.response;

            if (users.length >= 10_000) {
                this.logger.log(
                    `Job ${ResetUserTrafficCalendarWeekService.CRON_NAME} has found more than 10,000 users, skipping webhook/telegram events. Restarting all nodes.`,
                );

                this.eventBus.publish(new StartAllNodesEvent());

                return;
            }

            this.logger.log(
                `Job ${ResetUserTrafficCalendarWeekService.CRON_NAME} has found ${users.length} users.`,
            );

            for (const userUuid of users) {
                const userResponse = await this.getUserByUuid(userUuid.uuid);
                if (!userResponse.isOk || !userResponse.response) {
                    this.logger.debug('User not found');
                    continue;
                }

                const user = userResponse.response;

                this.eventEmitter.emit(
                    EVENTS.USER.ENABLED,
                    new UserEvent(user, EVENTS.USER.ENABLED),
                );

                this.eventBus.publish(new AddUserToNodeEvent(user));
            }

            this.logger.debug(`Reseted Daily Users Traffic. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(`Error in ResetUserWeeklyTrafficService: ${error}`);
        } finally {
            this.isJobRunning = false;
            users = null;
        }
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

    private async getUserByUuid(
        uuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        return this.queryBus.execute<
            GetUserByUuidQuery,
            ICommandResponse<UserWithActiveInboundsEntity>
        >(new GetUserByUuidQuery(uuid));
    }

    private async batchResetLimitedUsersTraffic(
        dto: BatchResetLimitedUsersTrafficCommand,
    ): Promise<ICommandResponse<{ uuid: string }[]>> {
        return this.commandBus.execute<
            BatchResetLimitedUsersTrafficCommand,
            ICommandResponse<
                {
                    uuid: string;
                }[]
            >
        >(new BatchResetLimitedUsersTrafficCommand(dto.strategy));
    }
}
