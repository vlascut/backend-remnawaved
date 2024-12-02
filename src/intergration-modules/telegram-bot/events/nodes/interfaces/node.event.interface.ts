import { NodesEntity } from '@modules/nodes/entities/nodes.entity';

export class NodeEvent {
    node: NodesEntity;

    constructor(node: NodesEntity) {
        this.node = node;
    }
}
