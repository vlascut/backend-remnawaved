import {
    Controller,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    Put,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { XrayConfigService } from './xray-config.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { ERRORS, ROLE } from '@contract/constants';
import { Roles } from '@common/decorators/roles/roles';
import { XRAY_CONTROLLER, XRAY_ROUTES } from '@contract/api';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { GetConfigResponseDto } from './dtos/get-config.dto';
import { GetConfigResponseModel } from './models/get-config.response.model';

@ApiTags('Xray Config Controller')
@UseFilters(HttpExceptionFilter)
@Controller(XRAY_CONTROLLER)
@UseGuards(JwtDefaultGuard, RolesGuard)
@Roles(ROLE.ADMIN)
export class XrayConfigController {
    constructor(private readonly xrayConfigService: XrayConfigService) {}

    @Get(XRAY_ROUTES.GET_CONFIG)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get Xray Config', description: 'Get Xray Config' })
    @ApiOkResponse({
        type: GetConfigResponseDto,
        description: 'Configuration retrieved successfully',
    })
    @ApiBadRequestResponse({ description: ERRORS.GET_CONFIG_ERROR.message })
    async getConfig(): Promise<GetConfigResponseDto> {
        const result = await this.xrayConfigService.getConfig();

        const data = errorHandler(result);
        return {
            response: new GetConfigResponseModel(data),
        };
    }

    @Put(XRAY_ROUTES.UPDATE_CONFIG)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update Xray Config', description: 'Update Xray Config' })
    @ApiOkResponse({
        type: GetConfigResponseDto,
        description: 'Configuration retrieved successfully',
    })
    @ApiBadRequestResponse({ description: ERRORS.UPDATE_CONFIG_ERROR.message })
    async updateConfig(@Body() config: object): Promise<GetConfigResponseDto> {
        const result = await this.xrayConfigService.updateConfig(config);

        const data = errorHandler(result);
        return {
            response: new GetConfigResponseModel(data),
        };
    }

    // @Get(KEYGEN_ROUTES.GET)
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: 'Get Public Key', description: 'Get public key' })
    // @ApiOkResponse({
    //     type: [GetPubKeyResponseDto],
    //     description: 'Access token for further requests',
    // })
    // @Roles(ROLE.ADMIN)
    // async generateKey(): Promise<GetPubKeyResponseDto> {
    //     const result = await this.keygenService.generateKey();

    //     const data = errorHandler(result);
    //     return {
    //         response: new KeygenResponseModel(data),
    //     };
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
