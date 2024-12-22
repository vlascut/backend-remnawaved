import { Injectable, Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants/errors';

import { InboundsRepository } from './repositories/inbounds.repository';
import { InboundsEntity } from './entities/inbounds.entity';

@Injectable()
export class InboundsService {
    private readonly logger = new Logger(InboundsService.name);

    constructor(private readonly inboundsRepository: InboundsRepository) {}

    async getInbounds(): Promise<ICommandResponse<InboundsEntity[]>> {
        try {
            const result = await this.inboundsRepository.findAll();

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(`Error getting inbounds: ${error}`);
            return {
                isOk: false,
                ...ERRORS.FIND_ALL_INBOUNDS_ERROR,
            };
        }
    }
}
