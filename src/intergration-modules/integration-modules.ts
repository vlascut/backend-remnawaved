import { Module } from '@nestjs/common';

import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
    imports: [TelegramBotModule],
})
export class IntegrationModules {}
