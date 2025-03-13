import { RemoveUserCommand as RemoveUserFromNodeCommandSdk } from '@remnawave/node-contract/build/commands';

export interface IRemoveUserFromNodePayload {
    data: RemoveUserFromNodeCommandSdk.Request;
    node: {
        address: string;
        port: number | null;
    };
}
