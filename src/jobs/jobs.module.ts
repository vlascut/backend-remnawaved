import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { PrometheusReporterModule } from '@intergration-modules/prometheus-reporter/prometheus-reporter.module';

import { JOBS_SERVICES } from './tasks';
import { METRIC_PROVIDERS } from './metrics-providers';

@Module({
    imports: [CqrsModule, PrometheusReporterModule],
    providers: [...JOBS_SERVICES, ...METRIC_PROVIDERS],
})
export class JobsModule {}
