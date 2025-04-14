import { ERRORS } from '@contract/constants';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';

import { HwidUserDevicesRepository } from '../../repositories/hwid-user-devices.repository';
import { CreateHwidUserDeviceCommand } from './create-hwid-user-device.command';

@CommandHandler(CreateHwidUserDeviceCommand)
export class CreateHwidUserDeviceHandler
    implements ICommandHandler<CreateHwidUserDeviceCommand, ICommandResponse<void>>
{
    public readonly logger = new Logger(CreateHwidUserDeviceHandler.name);

    constructor(private readonly hwidUserDevicesReposity: HwidUserDevicesRepository) {}

    async execute(command: CreateHwidUserDeviceCommand): Promise<ICommandResponse<void>> {
        try {
            await this.hwidUserDevicesReposity.create(command.hwidUserDevice);
            return {
                isOk: true,
            };
        } catch (error: unknown) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.CREATE_HWID_USER_DEVICE_ERROR,
            };
        }
    }
}
