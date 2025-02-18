import { InjectBot, Update } from '@kastov/grammy-nestjs';
import { Bot, Context } from 'grammy';

import { BOT_NAME } from './constants/bot-name.constant';
import { OnModuleInit } from '@nestjs/common';

@Update()
export class BotUpdateService {
    constructor(
        @InjectBot(BOT_NAME)
        private readonly bot: Bot<Context>,
    ) {}
}
