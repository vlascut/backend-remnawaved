import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { METRICS_ROOT } from '@libs/contracts/api';

@ApiBasicAuth('Prometheus')
@ApiTags('Prometheus')
@Controller(METRICS_ROOT)
@UseGuards(AuthGuard('basic'))
export class PrometheusReporterController extends PrometheusController {
    constructor() {
        super();
    }

    @ApiOperation({ summary: 'Prometheus Metrics' })
    @Get()
    async index(@Res({ passthrough: true }) response: Response) {
        return super.index(response);
    }
}
