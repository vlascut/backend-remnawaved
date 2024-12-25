import { ResetNodeInboundExclusionByNodeUuidHandler } from './reset-node-inbound-exclusions-by-node-uuid';
import { DeleteManyActiveInboubdsByUserUuidHandler } from './delete-many-active-inboubds-by-user-uuid';
import { CreateManyUserActiveInboundsHandler } from './create-many-user-active-inbounds';
import { DeleteManyInboundsHandler } from './delete-many-inbounds';
import { CreateManyInboundsHandler } from './create-many-inbounds';

export const COMMANDS = [
    DeleteManyInboundsHandler,
    CreateManyInboundsHandler,
    CreateManyUserActiveInboundsHandler,
    DeleteManyActiveInboubdsByUserUuidHandler,
    ResetNodeInboundExclusionByNodeUuidHandler,
];
