import { Injectable, Logger } from '@nestjs/common';
import { NodesRepository } from './repositories/nodes.repository';
import { ICommandResponse } from '../../common/types/command-response.type';
import { EnableNodeResponseModel } from './models';
import { ERRORS } from '@contract/constants';

@Injectable()
export class NodesService {
    private readonly logger = new Logger(NodesService.name);

    constructor(private readonly nodesRepository: NodesRepository) {}

    async enableNode(uuid: string): Promise<ICommandResponse<EnableNodeResponseModel>> {
        try {
            const node = await this.nodesRepository.findByUUID(uuid);
            if (!node) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            node.isDisabled = false;

            const result = await this.nodesRepository.update(node);

            if (!result) {
                return {
                    isOk: false,
                    ...ERRORS.ENABLE_NODE_ERROR,
                };
            }

            return {
                isOk: true,
                response: new EnableNodeResponseModel(result),
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.ENABLE_NODE_ERROR,
            };
        }
    }
}
