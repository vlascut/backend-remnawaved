import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { HttpModule } from '@nestjs/axios';

import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { BotUpdateService } from './bot.update.service';
import { BOT_NAME } from './constants/bot-name.constant';
import { TELEGRAM_BOT_EVENTS } from './events';

@Module({
    imports: [
        HttpModule,
        CqrsModule,
        ConfigModule,
        NestjsGrammyModule.forRootAsync({
            imports: [ConfigModule],
            botName: BOT_NAME,
            useFactory: async (configService: ConfigService) => ({
                token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [BotUpdateService, ...TELEGRAM_BOT_EVENTS],
})
export class TelegramBotModule {}
