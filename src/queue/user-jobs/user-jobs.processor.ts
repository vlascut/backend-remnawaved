import pMap from '@cjs-exporter/p-map';
import { Job } from 'bullmq';

import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { EVENTS } from '@libs/contracts/constants/events/events';

import { UserEvent } from '@intergration-modules/telegram-bot/events/users/interfaces/user.event.interface';

import { UpdateExceededTrafficUsersCommand } from '@modules/users/commands/update-exceeded-users';
import { UpdateExpiredUsersCommand } from '@modules/users/commands/update-expired-users';
import { RemoveUserFromNodeEvent } from '@modules/nodes/events/remove-user-from-node';
import { GetUserByUuidQuery } from '@modules/users/queries/get-user-by-uuid';
import { UserWithActiveInboundsEntity } from '@modules/users/entities';

import { StartAllNodesQueueService } from '@queue/start-all-nodes';

import { UserJobsJobNames } from './enums';
import { QueueNames } from '../queue.enum';

@Processor(QueueNames.userJobs)
export class UserJobsQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(UserJobsQueueProcessor.name);

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
        private readonly startAllNodesQueueService: StartAllNodesQueueService,
    ) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case UserJobsJobNames.findExpiredUsers:
                return this.handleFindExpiredUsers(job);
            case UserJobsJobNames.findExceededUsers:
                return this.handleFindExceededUsers(job);
            default:
                this.logger.warn(`Job "${job.name}" is not handled.`);
                break;
        }
    }

    private async handleFindExpiredUsers(job: Job) {
        try {
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

                await this.startAllNodesQueueService.startAllNodes({
                    emitter: job.name,
                });

                return;
            }

            this.logger.log(`Job ${job.name} Found ${users.length} expired users.`);

            await pMap(users, async (userUuid) => {
                try {
                    const userResponse = await this.getUserByUuid(userUuid.uuid);
                    if (!userResponse.isOk || !userResponse.response) {
                        return;
                    }

                    const user = userResponse.response;

                    this.eventEmitter.emit(
                        EVENTS.USER.EXPIRED,
                        new UserEvent(user, EVENTS.USER.EXPIRED),
                    );

                    // TODO: find a better way to do this. If previous user status was limited, this event will throw warning.
                    await this.eventBus.publish(new RemoveUserFromNodeEvent(user));
                } catch (error) {
                    this.logger.error(
                        `Error handling "${UserJobsJobNames.findExpiredUsers}" job: ${error}`,
                    );
                }
            });
        } catch (error) {
            this.logger.error(
                `Error handling "${UserJobsJobNames.findExpiredUsers}" job: ${error}`,
            );
        }
    }

    private async handleFindExceededUsers(job: Job) {
        try {
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

                await this.startAllNodesQueueService.startAllNodes({
                    emitter: job.name,
                });

                return;
            }

            this.logger.log(
                `Job ${job.name} has found ${users.length} exceeded traffic usage users.`,
            );

            await pMap(users, async (userUuid) => {
                try {
                    const userResponse = await this.getUserByUuid(userUuid.uuid);
                    if (!userResponse.isOk || !userResponse.response) {
                        this.logger.debug('User not found');
                        return;
                    }

                    const user = userResponse.response;

                    this.eventEmitter.emit(
                        EVENTS.USER.LIMITED,
                        new UserEvent(user, EVENTS.USER.LIMITED),
                    );

                    await this.eventBus.publish(new RemoveUserFromNodeEvent(user));
                } catch (error) {
                    this.logger.error(
                        `Error handling "${UserJobsJobNames.findExpiredUsers}" job: ${error}`,
                    );
                }
            });
        } catch (error) {
            this.logger.error(`Error handling "${job.name}" job: ${error}`);
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

    private async updateExceededTrafficUsers(): Promise<ICommandResponse<{ uuid: string }[]>> {
        return this.commandBus.execute<
            UpdateExceededTrafficUsersCommand,
            ICommandResponse<{ uuid: string }[]>
        >(new UpdateExceededTrafficUsersCommand());
    }
}
