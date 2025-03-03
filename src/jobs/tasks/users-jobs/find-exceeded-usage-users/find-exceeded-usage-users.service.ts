import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS } from '@libs/contracts/constants';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';

import { UserWithActiveInboundsEntity } from '@modules/users/entities/user-with-active-inbounds.entity';
import { UpdateExceededTrafficUsersCommand } from '@modules/users/commands/update-exceeded-users';
import { RemoveUserFromNodeEvent } from '@modules/nodes/events/remove-user-from-node';
import { GetUserByUuidQuery } from '@modules/users/queries/get-user-by-uuid';
import { StartAllNodesEvent } from '@modules/nodes/events/start-all-nodes';

import { JOBS_INTERVALS } from '@jobs/intervals';

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

            const usersResponse = await this.updateExceededTrafficUsers();
            if (!usersResponse.isOk || !usersResponse.response) {
                this.logger.error('No exceeded traffic usage users found');
                return;
            }

            const updatedUsers = usersResponse.response;

            if (updatedUsers.length === 0) {
                this.logger.debug('No exceeded traffic usage users found');
                return;
            }

            const users = usersResponse.response;

            if (users.length >= 10_000) {
                this.logger.log(
                    'More than 10,000 exceeded traffic usage users found, skipping webhook/telegram events.',
                );

                this.eventBus.publish(new StartAllNodesEvent());

                return;
            }

            this.logger.log(
                `Job ${FindExceededUsageUsersService.CRON_NAME} has found ${users.length} exceeded traffic usage users.`,
            );

            for (const userUuid of users) {
                const userResponse = await this.getUserByUuid(userUuid.uuid);
                if (!userResponse.isOk || !userResponse.response) {
                    this.logger.debug('User not found');
                    continue;
                }

                const user = userResponse.response;

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

    private async getUserByUuid(
        uuid: string,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity>> {
        return this.queryBus.execute<
            GetUserByUuidQuery,
            ICommandResponse<UserWithActiveInboundsEntity>
        >(new GetUserByUuidQuery(uuid));
    }

    private async updateExceededTrafficUsers(): Promise<ICommandResponse<{ uuid: string }[]>> {
        return this.commandBus.execute<
            UpdateExceededTrafficUsersCommand,
            ICommandResponse<{ uuid: string }[]>
        >(new UpdateExceededTrafficUsersCommand());
    }
}
