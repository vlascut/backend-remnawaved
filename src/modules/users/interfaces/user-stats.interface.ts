import { TUsersStatus } from '@libs/contracts/constants';

export interface UserStats {
    onlineLastMinute: number;
    statusCounts: Record<TUsersStatus, number>;
    totalUsers: number;
    totalTrafficBytes: bigint;
}
