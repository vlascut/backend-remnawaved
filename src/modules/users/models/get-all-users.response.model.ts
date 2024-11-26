import { UserWithActiveInboundsEntity } from '../entities/user-with-active-inbounds.entity';

export class GetAllUsersResponseModel {
    public readonly total: number;
    public readonly users: UserWithActiveInboundsEntity[];

    constructor(data: GetAllUsersResponseModel) {
        this.total = data.total;
        this.users = data.users;
    }
}
