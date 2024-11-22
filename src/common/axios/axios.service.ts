import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { GetNodeJwtCommand } from '../../modules/keygen/commands/get-node-jwt';
import { ICommandResponse } from '../types/command-response.type';
import { ERRORS } from '@contract/constants';
import {
    GetInboundStatsCommand,
    GetOutboundStatsCommand,
    GetStatusAndVersionCommand,
    GetSystemStatsCommand,
    GetUserOnlineStatusCommand,
    GetUsersStatsCommand,
    StartXrayCommand,
    StopXrayCommand,
    AddUserCommand,
    RemoveUserCommand,
    GetInboundUsersCommand,
    GetInboundUsersCountCommand,
    GetAllInboundsStatsCommand,
    GetAllOutboundsStatsCommand,
} from '@remnawave/node-contract';

@Injectable()
export class AxiosService implements OnApplicationBootstrap {
    public axiosInstance: AxiosInstance;
    private readonly logger = new Logger(AxiosService.name);
    constructor(private readonly commandBus: CommandBus) {
        this.axiosInstance = axios.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
    }

    async onApplicationBootstrap() {
        try {
            const response = await this.getNodeJwtCommand();
            const jwt = response.response;

            if (!jwt) {
                throw new Error('JWT is not defined');
            }

            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

            this.logger.log('Axios interceptor registered');
        } catch (error) {
            this.logger.error('Error in onApplicationBootstrap:', error);
        }
    }

    private async getNodeJwtCommand(): Promise<ICommandResponse<string>> {
        return this.commandBus.execute<GetNodeJwtCommand, ICommandResponse<string>>(
            new GetNodeJwtCommand(),
        );
    }

    private getNodeUrl(url: string, path: string, port: number | null): string {
        const protocol = port ? 'http' : 'https';
        const portSuffix = port ? `:${port}` : '';

        return `${protocol}://${url}${portSuffix}${path}`;
    }

    /*
     * XRAY MANAGEMENT
     */

    public async startXray(
        data: StartXrayCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<StartXrayCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, StartXrayCommand.url, port);
        try {
            const response = await this.axiosInstance.post<StartXrayCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                // this.logger.error(
                //     'Error in Axios StartXray Request:',
                //     JSON.stringify(error.message),
                // );

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in Axios StartXray Request:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    public async stopXray(
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<StopXrayCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, StopXrayCommand.url, port);
        try {
            const response = await this.axiosInstance.get<StopXrayCommand.Response>(nodeUrl);

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(
                    'Error in Axios StopXray Request:',
                    JSON.stringify(error.message),
                );

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in Axios StopXray Request:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    public async getXrayStatus(
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<GetStatusAndVersionCommand.Response>> {
        try {
            const nodeUrl = this.getNodeUrl(url, GetStatusAndVersionCommand.url, port);
            const response =
                await this.axiosInstance.get<GetStatusAndVersionCommand.Response>(nodeUrl);

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Error in axios request: ${error.message}`);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in getXrayStatus:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    /*
     * STATS MANAGEMENT
     */

    public async getUserOnlineStatus(
        data: GetUserOnlineStatusCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<GetUserOnlineStatusCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetUserOnlineStatusCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetUserOnlineStatusCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error('Error in getUserOnlineStatus:', error.response?.data);
            } else {
                this.logger.error('Error in getUserOnlineStatus:', error);
            }

            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }

    public async getUsersStats(
        data: GetUsersStatsCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<GetUsersStatsCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetUsersStatsCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetUsersStatsCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Error in Axios getUsersStats: ${error.message}`);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in getXrayStatus:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    public async getSystemStats(
        url: string,
        port: number | null,
        timeout: number = 10000,
    ): Promise<ICommandResponse<GetSystemStatsCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetSystemStatsCommand.url, port);

        try {
            const response = await this.axiosInstance.get<GetSystemStatsCommand.Response>(nodeUrl, {
                timeout,
            });

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                // this.logger.error(`Error in axios request: ${JSON.stringify(error.message)}`);

                if (error.code === '500') {
                    return {
                        isOk: false,
                        ...ERRORS.NODE_ERROR_500_WITH_MSG.withMessage(
                            JSON.stringify(error.message),
                        ),
                    };
                }

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in getXrayStatus:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    public async getInboundStats(
        data: GetInboundStatsCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<GetInboundStatsCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetInboundStatsCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetInboundStatsCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error('Error in getInboundStats:', error.response?.data);
            } else {
                this.logger.error('Error in getInboundStats:', error);
            }

            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }

    public async getAllInboundStats(
        data: GetAllInboundsStatsCommand.Request,
        url: string,
        port: number | null,
        timeout: number = 10000,
    ): Promise<ICommandResponse<GetAllInboundsStatsCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetAllInboundsStatsCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetAllInboundsStatsCommand.Response>(
                nodeUrl,
                data,
                { timeout },
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                // this.logger.error(`Error in axios request: ${JSON.stringify(error.message)}`);

                if (error.code === '500') {
                    return {
                        isOk: false,
                        ...ERRORS.NODE_ERROR_500_WITH_MSG.withMessage(
                            JSON.stringify(error.message),
                        ),
                    };
                }

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in getXrayStatus:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    public async getAllOutboundStats(
        data: GetAllOutboundsStatsCommand.Request,
        url: string,
        port: number | null,
        timeout: number = 10000,
    ): Promise<ICommandResponse<GetAllOutboundsStatsCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetAllOutboundsStatsCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetAllOutboundsStatsCommand.Response>(
                nodeUrl,
                data,
                { timeout },
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                // this.logger.error(`Error in axios request: ${JSON.stringify(error.message)}`);

                if (error.code === '500') {
                    return {
                        isOk: false,
                        ...ERRORS.NODE_ERROR_500_WITH_MSG.withMessage(
                            JSON.stringify(error.message),
                        ),
                    };
                }

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in getXrayStatus:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    public async getOutboundStats(
        data: GetOutboundStatsCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<GetOutboundStatsCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetOutboundStatsCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetOutboundStatsCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error('Error in getOutboundStats:', error.response?.data);
            } else {
                this.logger.error('Error in getOutboundStats:', error);
            }

            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }

    /*
     * User management
     */

    public async addUser(
        data: AddUserCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<AddUserCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, AddUserCommand.url, port);

        try {
            const response = await this.axiosInstance.post<AddUserCommand.Response>(nodeUrl, data);

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Error in axios request: ${error.message}`);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(JSON.stringify(error.message)),
                };
            } else {
                this.logger.error('Error in getXrayStatus:', error);

                return {
                    isOk: false,
                    ...ERRORS.NODE_ERROR_WITH_MSG.withMessage(
                        JSON.stringify(error) ?? 'Unknown error',
                    ),
                };
            }
        }
    }

    public async deleteUser(
        data: RemoveUserCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<RemoveUserCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, RemoveUserCommand.url, port);

        try {
            const response = await this.axiosInstance.post<RemoveUserCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error('Error in deleteUser:', error.response?.data);
            } else {
                this.logger.error('Error in deleteUser:', error);
            }

            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }

    public async getInboundUsers(
        data: GetInboundUsersCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<GetInboundUsersCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetInboundUsersCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetInboundUsersCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error('Error in getInboundUsers:', error.response?.data);
            } else {
                this.logger.error('Error in getInboundUsers:', error);
            }

            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }

    public async getInboundUsersCount(
        data: GetInboundUsersCountCommand.Request,
        url: string,
        port: number | null,
    ): Promise<ICommandResponse<GetInboundUsersCountCommand.Response>> {
        const nodeUrl = this.getNodeUrl(url, GetInboundUsersCountCommand.url, port);

        try {
            const response = await this.axiosInstance.post<GetInboundUsersCountCommand.Response>(
                nodeUrl,
                data,
            );

            return {
                isOk: true,
                response: response.data,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error('Error in getInboundUsersCount:', error.response?.data);
            } else {
                this.logger.error('Error in getInboundUsersCount:', error);
            }

            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
