import { Injectable, Logger } from '@nestjs/common';
import { NodesRepository } from './repositories/nodes.repository';
import { ICommandResponse } from '@common/types/command-response.type';
import { DeleteNodeResponseModel, RestartNodeResponseModel } from './models';
import { ERRORS } from '@contract/constants';
import { NodesEntity } from './entities/nodes.entity';
import { CreateNodeRequestDto, UpdateNodeRequestDto } from './dtos';
import { StartNodeEvent } from './events/start-node';
import { EventBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { StopNodeEvent } from './events/stop-node';
import { StartAllNodesEvent } from './events/start-all-nodes';

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
                trafficLimitBytes: body.trafficLimitBytes
                    ? BigInt(body.trafficLimitBytes)
                    : undefined,
            });
            const result = await this.nodesRepository.create(nodeEntity);

            // ! TODO: emit node created event
            this.eventBus.publish(new StartNodeEvent(result));

            return {
                isOk: true,
                response: result,
            };
        } catch (error) {
            this.logger.error(error);
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

    public async getAllNodes(): Promise<ICommandResponse<NodesEntity[]>> {
        try {
            return {
                isOk: true,
                response: await this.nodesRepository.findByCriteria({}),
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.GET_ALL_NODES_ERROR,
            };
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

            this.eventBus.publish(new StartNodeEvent(node));

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

    public async restartAllNodes(): Promise<ICommandResponse<RestartNodeResponseModel>> {
        try {
            const nodes = await this.nodesRepository.findByCriteria({
                isDisabled: false,
            });
            if (nodes.length === 0) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            // nodes.forEach((node) => {
            //     this.eventBus.publish(new StartNodeEvent(node));
            // });

            this.eventBus.publish(new StartAllNodesEvent());

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

    public async getOneNode(uuid: string): Promise<ICommandResponse<NodesEntity>> {
        try {
            const node = await this.nodesRepository.findByUUID(uuid);
            if (!node) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            return {
                isOk: true,
                response: node,
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.GET_ONE_NODE_ERROR,
            };
        }
    }

    public async deleteNode(uuid: string): Promise<ICommandResponse<DeleteNodeResponseModel>> {
        try {
            const node = await this.nodesRepository.findByUUID(uuid);
            if (!node) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            const result = await this.nodesRepository.deleteByUUID(node.uuid);

            this.eventBus.publish(new StopNodeEvent(node));

            return {
                isOk: true,
                response: new DeleteNodeResponseModel({
                    isDeleted: result,
                }),
            };
        } catch (error) {
            this.logger.error(JSON.stringify(error));
            return {
                isOk: false,
                ...ERRORS.DELETE_NODE_ERROR,
            };
        }
    }

    public async updateNode(body: UpdateNodeRequestDto): Promise<ICommandResponse<NodesEntity>> {
        try {
            const node = await this.nodesRepository.findByUUID(body.uuid);
            if (!node) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            const result = await this.nodesRepository.update({
                ...body,
                trafficLimitBytes: body.trafficLimitBytes
                    ? BigInt(body.trafficLimitBytes)
                    : undefined,
            });

            if (!result) {
                return {
                    isOk: false,
                    ...ERRORS.UPDATE_NODE_ERROR,
                };
            }

            this.eventBus.publish(new StartNodeEvent(result));

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

    public async enableNode(uuid: string): Promise<ICommandResponse<NodesEntity>> {
        try {
            const node = await this.nodesRepository.findByUUID(uuid);
            if (!node) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            const result = await this.nodesRepository.update({
                uuid: node.uuid,
                isDisabled: false,
            });

            if (!result) {
                return {
                    isOk: false,
                    ...ERRORS.ENABLE_NODE_ERROR,
                };
            }

            this.eventBus.publish(new StartNodeEvent(result));

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

    public async disableNode(uuid: string): Promise<ICommandResponse<NodesEntity>> {
        try {
            const node = await this.nodesRepository.findByUUID(uuid);
            if (!node) {
                return {
                    isOk: false,
                    ...ERRORS.NODE_NOT_FOUND,
                };
            }

            const result = await this.nodesRepository.update({
                uuid: node.uuid,
                isDisabled: true,
                isConnected: false,
                isConnecting: false,
                isNodeOnline: false,
                isXrayRunning: false,
            });

            if (!result) {
                return {
                    isOk: false,
                    ...ERRORS.ENABLE_NODE_ERROR,
                };
            }

            this.eventBus.publish(new StopNodeEvent(result));

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
