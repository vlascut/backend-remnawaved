import { Command } from '@nestjs/cqrs';

import { ICommandResponse } from '@common/types/command-response.type';

export class SyncActiveProfileCommand extends Command<
    ICommandResponse<{
        affectedRows: number;
    }>
> {
    constructor() {
        super();
    }
}
