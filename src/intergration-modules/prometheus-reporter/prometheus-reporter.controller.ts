import { PrometheusController as PrometheusControllerBase } from '@willsoto/nestjs-prometheus';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { BasicAuthGuard } from './guards';

@Controller()
export class PrometheusReporterController extends PrometheusControllerBase {
    constructor() {
        super();
    }

    @Get()
    @UseGuards(BasicAuthGuard)
    async index(@Res({ passthrough: true }) response: Response) {
        return super.index(response);
    }
}
