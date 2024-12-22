import { TUsersStatus } from '@libs/contracts/constants';

export interface UserStats {
    onlineLastMinute: number;
    statusCounts: Record<TUsersStatus, number>;
    totalTrafficBytes: bigint;
    totalUsers: number;
}
