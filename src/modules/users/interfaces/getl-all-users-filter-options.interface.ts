import { GetAllUsersCommand } from '@libs/contracts/commands';

export interface IGetUsersOptions {
    limit: number;
    offset: number;
    orderBy: GetAllUsersCommand.SortableField;
    orderDir: 'asc' | 'desc';
    search?: string;
    searchBy?: GetAllUsersCommand.SearchableField;
}
