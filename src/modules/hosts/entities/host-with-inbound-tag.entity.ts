import { HostsEntity } from './hosts.entity';

export class HostWithRawInbound extends HostsEntity {
    public rawInbound: object | null;
    public tag: string;

    constructor(data: HostWithRawInbound) {
        super(data);

        this.rawInbound = data.rawInbound;
        this.tag = data.tag;
    }
}
