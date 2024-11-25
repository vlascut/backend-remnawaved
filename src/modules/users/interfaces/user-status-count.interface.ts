import { TUsersStatus } from '@libs/contracts/constants';

export interface IUserStatusCount {
    status: TUsersStatus;
    count: number;
}
