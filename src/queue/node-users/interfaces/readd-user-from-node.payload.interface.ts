import { RemoveUserCommand as RemoveUserFromNodeCommandSdk } from '@remnawave/node-contract/build/commands';
import { AddUserCommand as AddUserToNodeCommandSdk } from '@remnawave/node-contract/build/commands';

export interface IReaddUserFromNodePayload {
    removePayload: RemoveUserFromNodeCommandSdk.Request;
    addPayload: AddUserToNodeCommandSdk.Request;
    node: {
        address: string;
        port: number | null;
    };
}
