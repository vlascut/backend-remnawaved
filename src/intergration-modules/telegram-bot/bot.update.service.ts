import { Update, Ctx, Start, InjectBot } from '@grammyjs/nestjs';

import { Bot, Context } from 'grammy';
import { BOT_NAME } from './constants/bot-name.constant';

@Update()
export class BotUpdateService {
    constructor(
        @InjectBot(BOT_NAME)
        private readonly bot: Bot<Context>,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context): Promise<any> {
        console.log('onStart!!', this.bot ? this.bot.botInfo.first_name : '(booting)');
    }
}
