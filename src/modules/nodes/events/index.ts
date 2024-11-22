import { StartNodeHandler } from './start-node';
import { AddUserToNodeHandler } from './add-user-to-node';
import { RemoveUserFromNodeHandler } from './remove-user-from-node';
import { StartAllNodesHandler } from './start-all-nodes';

export const EVENTS = [
    StartNodeHandler,
    StartAllNodesHandler,
    AddUserToNodeHandler,
    RemoveUserFromNodeHandler,
];
