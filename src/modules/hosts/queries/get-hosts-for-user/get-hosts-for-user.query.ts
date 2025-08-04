export class GetHostsForUserQuery {
    constructor(
        public readonly userUuid: string,
        public readonly returnDisabledHosts?: boolean,
    ) {}
}
