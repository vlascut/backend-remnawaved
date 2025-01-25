import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';
import { EVENTS, RESET_PERIODS, USERS_STATUS } from '@libs/contracts/constants';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';

import { UpdateStatusAndTrafficAndResetAtCommand } from '../../../users/commands/update-status-and-traffic-and-reset-at';
import { CreateUserTrafficHistoryCommand } from '../../../user-traffic-history/commands/create-user-traffic-history';
import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';
import { GetAllUsersQuery } from '../../../users/queries/get-all-users/get-all-users.query';
import { AddUserToNodeEvent } from '../../../nodes/events/add-user-to-node';
import { UserTrafficHistoryEntity } from '../../../user-traffic-history';
import { JOBS_INTERVALS } from '../../intervals';

dayjs.extend(utc);
dayjs.extend(timezone);

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

    @Cron(JOBS_INTERVALS.RESET_USER_TRAFFIC_CALENDAR_MONTH, {
        name: ResetUserTrafficCalendarMonthService.CRON_NAME,
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
                if (user.trafficLimitStrategy !== RESET_PERIODS.CALENDAR_MONTH) continue;

                const today = dayjs().utc();
                const currentDay = today.date();
                const firstDayOfMonth = today.startOf('month').date();

                const lastResetDate = dayjs(user.lastTrafficResetAt ?? user.createdAt).utc();

                if (currentDay !== firstDayOfMonth) continue;

                if (currentDay === firstDayOfMonth && lastResetDate.isSame(today, 'day')) {
                    continue;
                }

                let status = undefined;

                if (user.status === USERS_STATUS.LIMITED) {
                    status = USERS_STATUS.ACTIVE;
                    this.eventEmitter.emit(
                        EVENTS.USER.ENABLED,
                        new UserEvent(user, EVENTS.USER.ENABLED),
                    );
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
            this.logger.error(`Error in ResetUserTrafficService: ${error}`);
        } finally {
            this.isJobRunning = false;
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
