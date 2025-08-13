export class RemoveUserFromNodeEvent {
    constructor(
        public readonly username: string,
        public readonly vlessUuid: string,
    ) {}
}
