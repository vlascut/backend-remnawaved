import { DeleteManyInboundsHandler } from './delete-many-inbounds';
import { CreateManyInboundsHandler } from './create-many-inbounds';
import { CreateManyUserActiveInboundsHandler } from './create-many-user-active-inbounds';
import { DeleteManyActiveInboubdsByUserUuidHandler } from './delete-many-active-inboubds-by-user-uuid';

export const COMMANDS = [
    DeleteManyInboundsHandler,
    CreateManyInboundsHandler,
    CreateManyUserActiveInboundsHandler,
    DeleteManyActiveInboubdsByUserUuidHandler,
];
