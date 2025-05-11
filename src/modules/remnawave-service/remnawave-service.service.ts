import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EVENTS } from '@libs/contracts/constants';

import { ServiceEvent } from '@integration-modules/telegram-bot/events/service/interfaces';

@Injectable()
export class RemnawaveServiceService implements OnApplicationBootstrap {
    private readonly logger = new Logger(RemnawaveServiceService.name);
    constructor(private readonly eventEmitter: EventEmitter2) {}

    public async onApplicationBootstrap(): Promise<void> {
        this.eventEmitter.emit(
            EVENTS.SERVICE.PANEL_STARTED,
            new ServiceEvent(EVENTS.SERVICE.PANEL_STARTED, {}),
        );
    }
}
