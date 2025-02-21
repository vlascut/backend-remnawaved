import { UserWithActiveInboundsEntity } from '../entities/user-with-active-inbounds.entity';
import { ILastConnectedNode } from '@modules/nodes-user-usage-history/interfaces';

export interface IGetUserWithLastConnectedNode {
    user: UserWithActiveInboundsEntity;
    lastConnectedNode: ILastConnectedNode | null;
}
