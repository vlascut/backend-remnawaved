import { InjectBot } from '@kastov/grammy-nestjs';
import { readPackageJSON } from 'pkg-types';
import { Context } from 'grammy';
import { Bot } from 'grammy';

import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

import { EVENTS } from '@libs/contracts/constants';

import { BOT_NAME } from '@integration-modules/telegram-bot/constants';

import { TelegramBotLoggerQueueService } from '@queue/loggers/telegram-bot-logger';

import { ServiceEvent } from './interfaces/service.event.interface';

export class ServiceEvents {
    private readonly adminId: string;
    private readonly adminThreadId: string | undefined;
    constructor(
        @InjectBot(BOT_NAME)
        private readonly _: Bot<Context>,

        private readonly telegramBotLoggerQueueService: TelegramBotLoggerQueueService,
        private readonly configService: ConfigService,
    ) {
        this.adminId = this.configService.getOrThrow<string>('TELEGRAM_NOTIFY_NODES_CHAT_ID');
        this.adminThreadId = this.configService.get<string>('TELEGRAM_NOTIFY_NODES_THREAD_ID');
    }

    @OnEvent(EVENTS.SERVICE.PANEL_STARTED)
    async onPanelStarted(): Promise<void> {
        const pkg = await readPackageJSON();

        const msg = `
🌊 <b>#panel_started</b>
➖➖➖➖➖➖➖➖➖
✅ Remnawave v${pkg.version} is up and running.

🦋 Join community: @remnawave
📚 Documentation: https://remna.st

⭐ <a href="https://github.com/remnawave/panel">Leave a star on GitHub</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.SERVICE.LOGIN_ATTEMPT_FAILED)
    async onLoginAttemptFailed(event: ServiceEvent): Promise<void> {
        const msg = `
🔑 ❌ <b>#login_attempt_failed</b>
➖➖➖➖➖➖➖➖➖
<b>👥</b> <code>${event.data.loginAttempt?.username}</code>
<b>🔑 Password:</b> <code>${event.data.loginAttempt?.password}</code>
<b>🌐 IP:</b> <code>${event.data.loginAttempt?.ip}</code>
<b>💻 User agent:</b> <code>${event.data.loginAttempt?.userAgent}</code>
<b>💬 Description:</b> <code>${event.data.loginAttempt?.description}</code>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.SERVICE.LOGIN_ATTEMPT_SUCCESS)
    async onLoginAttemptSuccess(event: ServiceEvent): Promise<void> {
        const msg = `
🔑 ✅ <b>#login_attempt_success</b>
➖➖➖➖➖➖➖➖➖
<b>👥</b> <code>${event.data.loginAttempt?.username}</code>
<b>🌐 IP:</b> <code>${event.data.loginAttempt?.ip}</code>
<b>💻 User agent:</b> <code>${event.data.loginAttempt?.userAgent}</code>
<b>💬 Description:</b> <code>${event.data.loginAttempt?.description}</code>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId,
            threadId: this.adminThreadId,
        });
    }
}
