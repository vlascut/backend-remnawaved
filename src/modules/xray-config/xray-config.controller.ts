import { XRAY_CONTROLLER, XRAY_ROUTES } from '@contract/api';
import { ERRORS, ROLE } from '@contract/constants';

import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HttpExceptionFilter } from '@common/exception/httpException.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { Roles } from '@common/decorators/roles/roles';
import { RolesGuard } from '@common/guards/roles';

import { UpdateConfigRequestDto, UpdateConfigResponseDto } from './dtos/update-config.dto';
import { GetConfigResponseModel } from './models/get-config.response.model';
import { GetConfigResponseDto } from './dtos/get-config.dto';
import { XrayConfigService } from './xray-config.service';

@ApiTags('Xray Config Controller')
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(XRAY_CONTROLLER)
export class XrayConfigController {
    constructor(private readonly xrayConfigService: XrayConfigService) {}

    @ApiBadRequestResponse({ description: ERRORS.GET_CONFIG_ERROR.message })
    @ApiOkResponse({
        type: GetConfigResponseDto,
        description: 'Configuration retrieved successfully',
    })
    @ApiOperation({ summary: 'Get Xray Config', description: 'Get Xray Config' })
    @HttpCode(HttpStatus.OK)
    @Get(XRAY_ROUTES.GET_CONFIG)
    async getConfig(): Promise<GetConfigResponseDto> {
        const result = await this.xrayConfigService.getConfig();

        const data = errorHandler(result);
        return {
            response: new GetConfigResponseModel(data),
        };
    }

    @ApiBadRequestResponse({ description: ERRORS.UPDATE_CONFIG_ERROR.message })
    @ApiOkResponse({
        type: UpdateConfigResponseDto,
        description: 'Configuration updated successfully',
    })
    @ApiOperation({ summary: 'Update Xray Config', description: 'Update Xray Config' })
    @HttpCode(HttpStatus.OK)
    @Post(XRAY_ROUTES.UPDATE_CONFIG)
    async updateConfig(
        @Body() requestConfig: UpdateConfigRequestDto,
    ): Promise<UpdateConfigResponseDto> {
        const result = await this.xrayConfigService.updateConfigFromController(requestConfig);

        const data = errorHandler(result);
        return {
            response: new GetConfigResponseModel(data.config || {}),
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
}
