import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { METRICS_ROOT } from '@libs/contracts/api';

import { BasicAuthGuard } from './guards/basic-auth.guard';

@ApiBasicAuth('Prometheus')
@ApiTags('Prometheus')
@Controller(METRICS_ROOT)
export class PrometheusReporterController extends PrometheusController {
    constructor() {
        super();
    }

    @ApiOperation({ summary: 'Prometheus Metrics' })
    @Get()
    @UseGuards(BasicAuthGuard)
    async index(@Res({ passthrough: true }) response: Response) {
        return super.index(response);
    }
}
