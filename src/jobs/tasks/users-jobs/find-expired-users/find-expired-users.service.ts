import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS } from '@libs/contracts/constants';
import { UserWithActiveInboundsEntity } from '@modules/users/entities/user-with-active-inbounds.entity';
import { RemoveUserFromNodeEvent } from '@modules/nodes/events/remove-user-from-node';
import { JOBS_INTERVALS } from 'src/jobs/intervals';
import { UpdateExpiredUsersCommand } from '@modules/users/commands/update-expired-users';
import { GetUserByUuidQuery } from '@modules/users/queries/get-user-by-uuid';
import { StartAllNodesEvent } from '@modules/nodes/events/start-all-nodes';

@Injectable()
export class FindExpiredUsersService {
    private static readonly CRON_NAME = 'findExpiredUsers';
    private readonly logger = new Logger(FindExpiredUsersService.name);
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
        this.cronName = FindExpiredUsersService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.REVIEW_USERS.FIND_EXPIRED_USERS, {
        name: FindExpiredUsersService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const usersResponse = await this.updateExpiredUsers();
            if (!usersResponse.isOk || !usersResponse.response) {
                this.logger.error('No expired users found');
                return;
            }

            const updatedUsers = usersResponse.response;

            if (updatedUsers.length === 0) {
                this.logger.debug('No expired users found');
                return;
            }

            const users = usersResponse.response;

            if (users.length >= 10_000) {
                this.logger.log(
                    'More than 10,000 expired users found, skipping webhook/telegram events.',
                );

                this.eventBus.publish(new StartAllNodesEvent());

                return;
            }

            this.logger.log(
                `Job ${FindExpiredUsersService.CRON_NAME} Found ${users.length} expired users.`,
            );

            for (const userUuid of users) {
                const userResponse = await this.getUserByUuid(userUuid.uuid);
                if (!userResponse.isOk || !userResponse.response) {
                    this.logger.debug('User not found');
                    continue;
                }

                const user = userResponse.response;

                this.eventEmitter.emit(
                    EVENTS.USER.EXPIRED,
                    new UserEvent(user, EVENTS.USER.EXPIRED),
                );

                await this.eventBus.publish(new RemoveUserFromNodeEvent(user));
            }

            this.logger.debug(`Expired users reviewed. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(`Error in FindExpiredUsersService: ${error}`);
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

    private async updateExpiredUsers(): Promise<ICommandResponse<{ uuid: string }[]>> {
        return this.commandBus.execute<
            UpdateExpiredUsersCommand,
            ICommandResponse<{ uuid: string }[]>
        >(new UpdateExpiredUsersCommand());
    }
}
