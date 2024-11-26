import { UserWithLifetimeTrafficResponseModel } from './user-with-lf.response.model';

export class GetAllUsersResponseModel {
    public readonly total: number;
    public readonly users: UserWithLifetimeTrafficResponseModel[];

    constructor(data: GetAllUsersResponseModel) {
        this.total = data.total;
        this.users = data.users;
    }
}
