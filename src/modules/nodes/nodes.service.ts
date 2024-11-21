import { Injectable, Logger } from '@nestjs/common';
import { NodesRepository } from './repositories/nodes.repository';
import { ICommandResponse } from '../../common/types/command-response.type';
import { RestartNodeResponseModel } from './models';
import { ERRORS } from '@contract/constants';
import { NodesEntity } from './entities/nodes.entity';
import { CreateNodeRequestDto } from './dtos';
import { NodeCreatedEvent } from './events/node-created';
import { EventBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';

@Injectable()
export class NodesService {
    private readonly logger = new Logger(NodesService.name);

    constructor(
        private readonly nodesRepository: NodesRepository,
        private readonly eventBus: EventBus,
    ) {}

    public async createNode(body: CreateNodeRequestDto): Promise<ICommandResponse<NodesEntity>> {
        try {
            const nodeEntity = new NodesEntity({
                ...body,
                isConnected: false,
                isConnecting: false,
                isDisabled: false,
                isNodeOnline: false,
                isXrayRunning: false,
            });
            const result = await this.nodesRepository.create(nodeEntity);

            // ! TODO: emit node created event
            this.eventBus.publish(new NodeCreatedEvent(result));

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                error.meta?.modelName === 'Nodes' &&
                Array.isArray(error.meta.target)
            ) {
                const fields = error.meta.target as string[];
                if (fields.includes('name')) {
                    return { isOk: false, ...ERRORS.NODE_NAME_ALREADY_EXISTS };
                }
                if (fields.includes('address')) {
                    return { isOk: false, ...ERRORS.NODE_ADDRESS_ALREADY_EXISTS };
                }
            }

            return { isOk: false, ...ERRORS.CREATE_NODE_ERROR };
        }
    }

    public async restartNode(uuid: string): Promise<ICommandResponse<RestartNodeResponseModel>> {
        try {
            const node = await this.nodesRepository.findByUUID(uuid);
            if (!node) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            this.eventBus.publish(new NodeCreatedEvent(node));

            return {
                isOk: true,
                response: new RestartNodeResponseModel(true),
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.RESTART_NODE_ERROR,
            };
        }
    }

    public async enableNode(uuid: string): Promise<ICommandResponse<NodesEntity>> {
        try {
            // ! TODO: finish this
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
                response: result,
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
