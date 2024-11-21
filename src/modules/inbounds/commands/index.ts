import { DeleteManyInboundsHandler } from './delete-many-inbounds';
import { CreateManyInboundsHandler } from './create-many-inbounds';
import { CreateManyUserActiveInboundsHandler } from './create-many-user-active-inbounds';

export const COMMANDS = [
    DeleteManyInboundsHandler,
    CreateManyInboundsHandler,
    CreateManyUserActiveInboundsHandler,
];
