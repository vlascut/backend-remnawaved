import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';
import { Logger } from '@nestjs/common';
import { GetAllInboundsQuery } from './get-all-inbounds.query';
import { InboundsRepository } from '../../repositories/inbounds.repository';
import { InboundsEntity } from '../../entities/inbounds.entity';
import { Transactional } from '@nestjs-cls/transactional';

@QueryHandler(GetAllInboundsQuery)
export class GetAllInboundsHandler
    implements IQueryHandler<GetAllInboundsQuery, ICommandResponse<InboundsEntity[]>>
{
    private readonly logger = new Logger(GetAllInboundsHandler.name);
    constructor(private readonly inboundsRepository: InboundsRepository) {}

    @Transactional()
    async execute(): Promise<ICommandResponse<InboundsEntity[]>> {
        try {
            const inbounds = await this.inboundsRepository.findAll();
            return {
                isOk: true,
                response: inbounds,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
