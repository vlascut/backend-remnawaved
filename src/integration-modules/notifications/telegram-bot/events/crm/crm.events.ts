import { InjectBot } from '@kastov/grammy-nestjs';
import { Context } from 'grammy';
import { Bot } from 'grammy';
import dayjs from 'dayjs';

import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

import { EVENTS } from '@libs/contracts/constants';

import { CrmEvent } from '@integration-modules/notifications/interfaces';

import { TelegramBotLoggerQueueService } from '@queue/notifications/telegram-bot-logger';

import { BOT_NAME } from '../../constants/bot-name.constant';
import { RequireAdminId } from '../../decorators';

export class CrmEvents {
    private readonly adminId: string | undefined;
    private readonly adminThreadId: string | undefined;

    constructor(
        @InjectBot(BOT_NAME)
        private readonly _: Bot<Context>,

        private readonly telegramBotLoggerQueueService: TelegramBotLoggerQueueService,
        private readonly configService: ConfigService,
    ) {
        this.adminId = this.configService.get<string>('TELEGRAM_NOTIFY_CRM_CHAT_ID');
        this.adminThreadId = this.configService.get<string>('TELEGRAM_NOTIFY_CRM_THREAD_ID');
    }

    @OnEvent(EVENTS.CRM.INFRA_BILLING_NODE_PAYMENT_IN_7_DAYS)
    @RequireAdminId()
    async onInfraBillingNodePaymentIn7Days(event: CrmEvent): Promise<void> {
        const msg = `
📅 <b>Payment Reminder</b>

🏢 <b>Provider:</b> <code>${event.data.providerName}</code>
🖥️ <b>Node:</b> <code>${event.data.nodeName}</code>
📆 <b>Due Date:</b> <code>${dayjs(event.data.nextBillingAt).format('DD.MM.YYYY')}</code>

🔗 <a href="${event.data.loginUrl}">Open Provider Panel</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId!,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.CRM.INFRA_BILLING_NODE_PAYMENT_IN_48HRS)
    @RequireAdminId()
    async onInfraBillingNodePaymentIn48Hrs(event: CrmEvent): Promise<void> {
        const msg = `
⚠️ <b>Payment Alert - 2 Days Warning</b>

🏢 <b>Provider:</b> <code>${event.data.providerName}</code>
🖥️ <b>Node:</b> <code>${event.data.nodeName}</code>
📆 <b>Due Date:</b> <code>${dayjs(event.data.nextBillingAt).format('DD.MM.YYYY')}</code>

⚡ <i>Payment is due in 2 days!</i>

🔗 <a href="${event.data.loginUrl}">Open Provider Panel</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId!,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.CRM.INFRA_BILLING_NODE_PAYMENT_IN_24HRS)
    @RequireAdminId()
    async onInfraBillingNodePaymentIn24Hrs(event: CrmEvent): Promise<void> {
        const msg = `
🚨 <b>URGENT: Payment Due Tomorrow!</b>

🏢 <b>Provider:</b> <code>${event.data.providerName}</code>
🖥️ <b>Node:</b> <code>${event.data.nodeName}</code>
📆 <b>Due Date:</b> <code>${dayjs(event.data.nextBillingAt).format('DD.MM.YYYY')}</code>

🔥 <i>Payment is due tomorrow!</i>

🔗 <a href="${event.data.loginUrl}">Open Provider Panel</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId!,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.CRM.INFRA_BILLING_NODE_PAYMENT_DUE_TODAY)
    @RequireAdminId()
    async onInfraBillingNodePaymentDueToday(event: CrmEvent): Promise<void> {
        const msg = `
🔴 <b>CRITICAL: Payment Due TODAY!</b>

🏢 <b>Provider:</b> <code>${event.data.providerName}</code>
🖥️ <b>Node:</b> <code>${event.data.nodeName}</code>
📆 <b>Due Date:</b> <code>${dayjs(event.data.nextBillingAt).format('DD.MM.YYYY')}</code>

⚡ <i>Payment must be completed today!</i>

🔗 <a href="${event.data.loginUrl}">Open Provider Panel</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId!,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.CRM.INFRA_BILLING_NODE_PAYMENT_OVERDUE_24HRS)
    @RequireAdminId()
    async onInfraBillingNodePaymentOverdue24Hrs(event: CrmEvent): Promise<void> {
        const daysPastDue = Math.abs(dayjs().diff(dayjs(event.data.nextBillingAt), 'day'));
        const msg = `
❌ <b>OVERDUE: First Notice</b>

🏢 <b>Provider:</b> <code>${event.data.providerName}</code>
🖥️ <b>Node:</b> <code>${event.data.nodeName}</code>
📆 <b>Due Date:</b> <code>${dayjs(event.data.nextBillingAt).format('DD.MM.YYYY')}</code>
⚠️ <b>Days Overdue:</b> <code>${daysPastDue} day(s)</code>

🚨 <i>Payment is overdue!</i>

🔗 <a href="${event.data.loginUrl}">Open Provider Panel</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId!,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.CRM.INFRA_BILLING_NODE_PAYMENT_OVERDUE_48HRS)
    @RequireAdminId()
    async onInfraBillingNodePaymentOverdue48Hrs(event: CrmEvent): Promise<void> {
        const daysPastDue = Math.abs(dayjs().diff(dayjs(event.data.nextBillingAt), 'day'));
        const msg = `
🔥 <b>OVERDUE: Second Notice</b>

🏢 <b>Provider:</b> <code>${event.data.providerName}</code>
🖥️ <b>Node:</b> <code>${event.data.nodeName}</code>
📆 <b>Due Date:</b> <code>${dayjs(event.data.nextBillingAt).format('DD.MM.YYYY')}</code>
⚠️ <b>Days Overdue:</b> <code>${daysPastDue} day(s)</code>

⚡ <i>Critical: Service suspension imminent!</i>

🔗 <a href="${event.data.loginUrl}">Open Provider Panel</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId!,
            threadId: this.adminThreadId,
        });
    }

    @OnEvent(EVENTS.CRM.INFRA_BILLING_NODE_PAYMENT_OVERDUE_7_DAYS)
    @RequireAdminId()
    async onInfraBillingNodePaymentOverdue7Days(event: CrmEvent): Promise<void> {
        const daysPastDue = Math.abs(dayjs().diff(dayjs(event.data.nextBillingAt), 'day'));
        const msg = `
💀 <b>FINAL NOTICE: Service Termination Risk</b>

🏢 <b>Provider:</b> <code>${event.data.providerName}</code>
🖥️ <b>Node:</b> <code>${event.data.nodeName}</code>
📆 <b>Due Date:</b> <code>${dayjs(event.data.nextBillingAt).format('DD.MM.YYYY')}</code>
⚠️ <b>Days Overdue:</b> <code>${daysPastDue} day(s)</code>

🔗 <a href="${event.data.loginUrl}">Open Provider Panel</a>
        `;
        await this.telegramBotLoggerQueueService.addJobToSendTelegramMessage({
            message: msg,
            chatId: this.adminId!,
            threadId: this.adminThreadId,
        });
    }
}
