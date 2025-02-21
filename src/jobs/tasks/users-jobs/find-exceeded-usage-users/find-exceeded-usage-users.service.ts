import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS, USERS_STATUS } from '@libs/contracts/constants';
import { UserWithActiveInboundsEntity } from '@modules/users/entities/user-with-active-inbounds.entity';
import { ChangeUserStatusCommand } from '@modules/users/commands/change-user-status';
import { RemoveUserFromNodeEvent } from '@modules/nodes/events/remove-user-from-node';
import { JOBS_INTERVALS } from 'src/jobs/intervals';
import { GetExceededTrafficUsageUsersQuery } from '@modules/users/queries/get-exceeded-traffic-usage-users';

@Injectable()
export class FindExceededUsageUsersService {
    private static readonly CRON_NAME = 'findExceededUsageUsers';
    private readonly logger = new Logger(FindExceededUsageUsersService.name);
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
        this.cronName = FindExceededUsageUsersService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.REVIEW_USERS.FIND_EXCEEDED_TRAFFIC_USAGE_USERS, {
        name: FindExceededUsageUsersService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const usersResponse = await this.getAllExceededTrafficUsageUsers();
            if (!usersResponse.isOk || !usersResponse.response) {
                this.logger.error('No exceeded traffic usage users found');
                return;
            }

            const users = usersResponse.response;

            for (const user of users) {
                await this.changeUserStatus({
                    userUuid: user.uuid,
                    status: USERS_STATUS.LIMITED,
                });
                this.eventEmitter.emit(
                    EVENTS.USER.LIMITED,
                    new UserEvent(user, EVENTS.USER.LIMITED),
                );

                await this.eventBus.publish(new RemoveUserFromNodeEvent(user));
            }

            this.logger.debug(
                `Exceeded traffic usage users reviewed. Time: ${formatExecutionTime(ct)}`,
            );
        } catch (error) {
            this.logger.error(`Error in FindExceededUsageUsersService: ${error}`);
        } finally {
            this.isJobRunning = false;
        }
    }

    private async getAllExceededTrafficUsageUsers(): Promise<
        ICommandResponse<UserWithActiveInboundsEntity[]>
    > {
        return this.queryBus.execute<
            GetExceededTrafficUsageUsersQuery,
            ICommandResponse<UserWithActiveInboundsEntity[]>
        >(new GetExceededTrafficUsageUsersQuery());
    }

    private async changeUserStatus(dto: ChangeUserStatusCommand): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<ChangeUserStatusCommand, ICommandResponse<void>>(
            new ChangeUserStatusCommand(dto.userUuid, dto.status),
        );
    }
}
