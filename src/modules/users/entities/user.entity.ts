import { InternalSquadEntity } from '@modules/internal-squads/entities';

import { BaseUserEntity } from './base-users.entity';

export interface ILastConnectedNode {
    nodeName: string;
    connectedAt: Date;
}

interface ILastConnectedNodeWithActiveInternalSquads {
    lastConnectedNode?: {
        name: string;
    } | null;
    activeInternalSquads?: Omit<InternalSquadEntity, 'createdAt' | 'updatedAt'>[];
}

export class UserEntity extends BaseUserEntity {
    public readonly activeInternalSquads: Omit<InternalSquadEntity, 'createdAt' | 'updatedAt'>[];
    public readonly lastConnectedNode: ILastConnectedNode | null;

    constructor(user: BaseUserEntity & ILastConnectedNodeWithActiveInternalSquads) {
        super(user);
        Object.assign(this, user);

        if (user.lastConnectedNode && user.onlineAt) {
            this.lastConnectedNode = {
                nodeName: user.lastConnectedNode.name,
                connectedAt: user.onlineAt,
            };
        } else {
            this.lastConnectedNode = null;
        }

        this.activeInternalSquads = user.activeInternalSquads ?? [];

        return this;
    }
}
