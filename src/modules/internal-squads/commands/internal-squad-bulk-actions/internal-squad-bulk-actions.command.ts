import { Command } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

export class InternalSquadBulkActionsCommand extends Command<
    ICommandResponse<{
        affectedRows: number;
    }>
> {
    constructor(
        public readonly internalSquadUuid: string,
        public readonly action: 'add' | 'remove',
    ) {
        super();
    }
}
