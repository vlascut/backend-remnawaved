import { Body, Controller, Get, Param, Put, UseFilters } from '@nestjs/common';
import { XrayConfigService } from './xray-config.service';
// import { XRAY_CONFIG_CONTROLLER } from '@contract/api';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { ROLE } from '@contract/constants';
import { Roles } from '@common/decorators/roles/roles';
import { errorHandler } from '@common/helpers/error-handler.helper';

// @ApiTags('Xray Config Controller')
// @UseFilters(HttpExceptionFilter)
// @Controller(XRAY_CONFIG_CONTROLLER)
@Controller('xray-config')
export class XrayConfigController {
    constructor(private readonly xrayConfigService: XrayConfigService) {}

    @Get('123')
    @ApiOperation({ summary: 'Get Xray Config', description: 'Get xray configuration' })
    @ApiOkResponse({ description: 'Configuration retrieved successfully' })
    async getConfig(): Promise<any> {
        const result = await this.xrayConfigService.getConfig();
        return result;
    }

    // @Get(':uuid')
    // @ApiOperation({ summary: 'Get Xray Config', description: 'Get xray configuration by UUID' })
    // @ApiOkResponse({ description: 'Configuration retrieved successfully' })
    // @Roles(ROLE.ADMIN)
    // async getConfig(@Param('uuid') uuid: string) {
    //     const result = await this.xrayConfigService.getConfig(uuid);
    //     return errorHandler(result);
    // }

    // @Put(':uuid')
    // @ApiOperation({ summary: 'Update Xray Config', description: 'Update xray configuration' })
    // @ApiOkResponse({ description: 'Configuration updated successfully' })
    // @Roles(ROLE.ADMIN)
    // async updateConfig(@Param('uuid') uuid: string, @Body() config: object) {
    //     const result = await this.xrayConfigService.updateConfig(uuid, config);
    //     return errorHandler(result);
    // }
}
