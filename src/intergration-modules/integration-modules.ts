import { Module } from '@nestjs/common';

import { PrometheusReporterModule } from './prometheus-reporter/prometheus-reporter.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
    imports: [TelegramBotModule, PrometheusReporterModule],
})
export class IntegrationModules {}
