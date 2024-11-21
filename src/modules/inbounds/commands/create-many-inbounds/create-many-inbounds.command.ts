import { InboundsWithTagsAndType } from '../../interfaces/inboubds-with-tags-and-type.interface';

export class CreateManyInboundsCommand {
    constructor(public readonly inbounds: InboundsWithTagsAndType[]) {}
}
