import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces';
import { formatExecutionTime, getTime } from '@common/utils/get-elapsed-time';
import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS, USERS_STATUS } from '@libs/contracts/constants';
import { AxiosService } from '@common/axios';

import { ChangeUserStatusCommand } from '../../../users/commands/change-user-status/change-user-status.command';
import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';
import { GetActiveUsersQuery } from '../../../users/queries/get-active-users/get-active-users.query';
import { RemoveUserFromNodeEvent } from '../../../nodes/events/remove-user-from-node';
import { JOBS_INTERVALS } from '../../intervals';

@Injectable()
export class ReviewUsersService {
    private static readonly CRON_NAME = 'reviewUsers';
    private readonly logger = new Logger(ReviewUsersService.name);
    private isJobRunning: boolean;
    private cronName: string;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly axios: AxiosService,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.isJobRunning = false;
        this.cronName = ReviewUsersService.CRON_NAME;
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

    @Cron(JOBS_INTERVALS.REVIEW_USERS, {
        name: ReviewUsersService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.checkJobRunning()) return;
            const ct = getTime();
            this.isJobRunning = true;

            const usersResponse = await this.getAllActiveUsers();
            if (!usersResponse.isOk || !usersResponse.response) {
                this.logger.error('No active users found');
                return;
            }

            const users = usersResponse.response;

            for (const user of users) {
                let shouldRemoveFromNode = false;

                if (
                    user.usedTrafficBytes >= user.trafficLimitBytes &&
                    user.trafficLimitBytes !== BigInt(0)
                ) {
                    await this.changeUserStatus({
                        userUuid: user.uuid,
                        status: USERS_STATUS.LIMITED,
                    });
                    shouldRemoveFromNode = true;
                    this.eventEmitter.emit(EVENTS.USER.LIMITED, new UserEvent(user));
                }

                if (user.expireAt < new Date()) {
                    await this.changeUserStatus({
                        userUuid: user.uuid,
                        status: USERS_STATUS.EXPIRED,
                    });
                    shouldRemoveFromNode = true;
                    this.eventEmitter.emit(EVENTS.USER.EXPIRED, new UserEvent(user));
                }

                if (shouldRemoveFromNode) {
                    await this.eventBus.publish(new RemoveUserFromNodeEvent(user));
                }
            }

            this.logger.debug(`Users reviewed. Time: ${formatExecutionTime(ct)}`);
        } catch (error) {
            this.logger.error(error);
        } finally {
            this.isJobRunning = false;
        }
    }

    private async getAllActiveUsers(): Promise<ICommandResponse<UserWithActiveInboundsEntity[]>> {
        return this.queryBus.execute<
            GetActiveUsersQuery,
            ICommandResponse<UserWithActiveInboundsEntity[]>
        >(new GetActiveUsersQuery());
    }

    private async changeUserStatus(dto: ChangeUserStatusCommand): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<ChangeUserStatusCommand, ICommandResponse<void>>(
            new ChangeUserStatusCommand(dto.userUuid, dto.status),
        );
    }
}
