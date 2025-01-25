import { NodesEntity } from '@modules/nodes/entities/nodes.entity';
import { TNodeEvents } from '@libs/contracts/constants';

export class NodeEvent {
    node: NodesEntity;
    eventName: TNodeEvents;

    constructor(node: NodesEntity, event: TNodeEvents) {
        this.node = node;
        this.eventName = event;
    }
}
