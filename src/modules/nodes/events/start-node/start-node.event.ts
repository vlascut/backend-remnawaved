import { NodesEntity } from '../../entities/nodes.entity';

export class StartNodeEvent {
    constructor(public readonly node: NodesEntity) {}
}
