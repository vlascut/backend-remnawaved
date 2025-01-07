import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { PrometheusReporterController } from './prometheus-reporter.controller';

@Module({
    imports: [
        ConfigModule,
        PrometheusModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                path: configService.getOrThrow('METRICS_ENDPOINT'),
                defaultLabels: {
                    app: 'remnawave',
                },
                customMetricPrefix: 'remnawave',
                controller: PrometheusReporterController,
            }),
        }),
    ],
    controllers: [PrometheusReporterController],
    providers: [],
    exports: [PrometheusModule],
})
export class PrometheusReporterModule {}
