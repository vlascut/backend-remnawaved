import { NodesEntity } from '../../entities/nodes.entity';

export class NodeCreatedEvent {
    constructor(public readonly node: NodesEntity) {}
}
