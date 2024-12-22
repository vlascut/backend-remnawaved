import { ReaddUserToNodeHandler } from './readd-user-to-node/readd-user-to-node.handler';
import { RemoveUserFromNodeHandler } from './remove-user-from-node';
import { AddUserToNodeHandler } from './add-user-to-node';
import { StartAllNodesHandler } from './start-all-nodes';
import { StartNodeHandler } from './start-node';
import { StopNodeHandler } from './stop-node';

export const EVENTS = [
    StartNodeHandler,
    StartAllNodesHandler,
    AddUserToNodeHandler,
    RemoveUserFromNodeHandler,
    StopNodeHandler,
    ReaddUserToNodeHandler,
];
