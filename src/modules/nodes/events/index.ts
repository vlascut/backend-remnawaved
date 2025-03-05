import { ReaddUserToNodeHandler } from './readd-user-to-node/readd-user-to-node.handler';
import { RemoveUserFromNodeHandler } from './remove-user-from-node';
import { AddUserToNodeHandler } from './add-user-to-node';
import { StopNodeHandler } from './stop-node';

export const EVENTS = [
    AddUserToNodeHandler,
    RemoveUserFromNodeHandler,
    StopNodeHandler,
    ReaddUserToNodeHandler,
];
