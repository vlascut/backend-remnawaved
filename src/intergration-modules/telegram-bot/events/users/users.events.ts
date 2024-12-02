import { InjectBot } from '@grammyjs/nestjs';
import { Bot, Context } from 'grammy';
import { BOT_NAME } from '../../constants';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { EVENTS } from '@libs/contracts/constants';
import { parseMode } from '@grammyjs/parse-mode';
import { UserEvent } from './interfaces';
import { prettyBytesUtil } from '@common/utils/bytes';
import dayjs from 'dayjs';

export class UsersEvents {
    private readonly adminId: string;

    constructor(
        @InjectBot(BOT_NAME)
        private readonly bot: Bot<Context>,
        private readonly configService: ConfigService,
    ) {
        this.adminId = configService.getOrThrow<string>('TELEGRAM_ADMIN_ID');
        this.bot.api.config.use(parseMode('html'));
    }

    @OnEvent(EVENTS.USER.CREATED)
    async onUserCreated(event: UserEvent): Promise<void> {
        const msg = `
🆕 <b>#created</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
<b>Traffic limit:</b> <code>${prettyBytesUtil(event.user.trafficLimitBytes)}</code>
<b>Expired at:</b> <code>${dayjs(event.user.expireAt).format('DD.MM.YYYY HH:mm')}</code>
<b>Sub:</b> <code>${event.user.shortUuid}</code>
<b>Inbounds:</b> <code>${event.user.activeUserInbounds.map((inbound) => inbound.tag).join(', ')}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.USER.MODIFIED)
    async onUserModified(event: UserEvent): Promise<void> {
        const msg = `
📝 <b>#modified</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
<b>Traffic limit:</b> <code>${prettyBytesUtil(event.user.trafficLimitBytes)}</code>
<b>Expired at:</b> <code>${dayjs(event.user.expireAt).format('DD.MM.YYYY HH:mm')}</code>
<b>Sub:</b> <code>${event.user.shortUuid}</code>
<b>Inbounds:</b> <code>${event.user.activeUserInbounds.map((inbound) => inbound.tag).join(', ')}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.USER.REVOKED)
    async onUserRevoked(event: UserEvent): Promise<void> {
        const msg = `
🔄 <b>#revoked</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
<b>Traffic limit:</b> <code>${prettyBytesUtil(event.user.trafficLimitBytes)}</code>
<b>Expired at:</b> <code>${dayjs(event.user.expireAt).format('DD.MM.YYYY HH:mm')}</code>
<b>Sub:</b> <code>${event.user.shortUuid}</code>
<b>Inbounds:</b> <code>${event.user.activeUserInbounds.map((inbound) => inbound.tag).join(', ')}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.USER.DELETED)
    async onUserDeleted(event: UserEvent): Promise<void> {
        const msg = `
🔴 <b>#deleted</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.USER.DISABLED)
    async onUserDisabled(event: UserEvent): Promise<void> {
        const msg = `
❌ <b>#disabled</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.USER.ENABLED)
    async onUserEnabled(event: UserEvent): Promise<void> {
        const msg = `
✅ <b>#enabled</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.USER.LIMITED)
    async onUserLimited(event: UserEvent): Promise<void> {
        const msg = `
⚠️ <b>#limited</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.USER.EXPIRED)
    async onUserExpired(event: UserEvent): Promise<void> {
        const msg = `
⏱️ <b>#expired</b>
➖➖➖➖➖➖➖➖➖
<b>Username:</b> <code>${event.user.username}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }
}
