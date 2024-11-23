import { NodesEntity } from '../../entities/nodes.entity';

export class StopNodeEvent {
    constructor(public readonly node: NodesEntity) {}
}
