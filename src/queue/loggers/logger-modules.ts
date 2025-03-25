import { TelegramBotLoggerQueueModule } from './telegram-bot-logger/telegram-bot-logger.module';
import { WebhookLoggerQueueModule } from './webhook-logger/webhook-logger.module';

export const LOGGER_MODULES = [TelegramBotLoggerQueueModule, WebhookLoggerQueueModule];
