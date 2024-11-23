import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Logger } from '@nestjs/common';
import { GetValidatedConfigQuery } from './get-validated-config.query';
import { IXrayConfig } from '../../../../common/helpers/xray-config/interfaces';
import { XrayConfigService } from '../../xray-config.service';
import { XRayConfig } from '../../../../common/helpers/xray-config';

@QueryHandler(GetValidatedConfigQuery)
export class GetValidatedConfigHandler
    implements IQueryHandler<GetValidatedConfigQuery, XRayConfig | null>
{
    private readonly logger = new Logger(GetValidatedConfigHandler.name);

    constructor(
        private readonly xrayService: XrayConfigService,
        private readonly queryBus: QueryBus,
    ) {}

    async execute(): Promise<XRayConfig | null> {
        try {
            const config = await this.xrayService.getConfigInstance();

            return config;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }
}
