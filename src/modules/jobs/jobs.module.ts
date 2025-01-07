import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { PrometheusReporterModule } from '@intergration-modules/prometheus-reporter/prometheus-reporter.module';

import { JOBS_SERVICES } from './tasks';

@Module({
    imports: [CqrsModule, PrometheusReporterModule],
    providers: [
        ...JOBS_SERVICES,
        makeGaugeProvider({
            name: 'node_online_users',
            help: 'Number of online users on a node',
            labelNames: ['node_uuid', 'node_name'],
        }),
    ],
})
export class JobsModule {}
