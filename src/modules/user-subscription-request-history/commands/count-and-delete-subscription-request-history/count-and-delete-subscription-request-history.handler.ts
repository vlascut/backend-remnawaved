import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { UserSubscriptionRequestHistoryRepository } from '../../repositories/user-subscription-request-history.repository';
import { CountAndDeleteSubscriptionRequestHistoryCommand } from './count-and-delete-subscription-request-history.command';

@CommandHandler(CountAndDeleteSubscriptionRequestHistoryCommand)
export class CountAndDeleteSubscriptionRequestHistoryHandler
    implements ICommandHandler<CountAndDeleteSubscriptionRequestHistoryCommand, void>
{
    public readonly logger = new Logger(CountAndDeleteSubscriptionRequestHistoryCommand.name);

    constructor(
        private readonly userSubscriptionRequestHistoryRepository: UserSubscriptionRequestHistoryRepository,
    ) {}

    async execute(command: CountAndDeleteSubscriptionRequestHistoryCommand): Promise<void> {
        try {
            const { userUuid } = command;

            const count =
                await this.userSubscriptionRequestHistoryRepository.countByUserUuid(userUuid);

            if (count > 24) {
                const oldest =
                    await this.userSubscriptionRequestHistoryRepository.findOldestByUserUuid(
                        userUuid,
                    );
                if (oldest) {
                    await this.userSubscriptionRequestHistoryRepository.deleteById(oldest.id);
                }
            }

            return;
        } catch (error: unknown) {
            this.logger.error('Error:', {
                message: (error as Error).message,
                name: (error as Error).name,
                stack: (error as Error).stack,
                ...(error as object),
            });
            return;
        }
    }
}
