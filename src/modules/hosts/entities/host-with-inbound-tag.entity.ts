import { HostsEntity } from './hosts.entity';

type HostWithRawInboundConstructorData = {
    rawInbound: object | null;
    tag: string;
} & ConstructorParameters<typeof HostsEntity>[0];

export class HostWithRawInbound extends HostsEntity {
    public rawInbound: object | null;
    public tag: string;

    constructor(data: HostWithRawInboundConstructorData) {
        super(data);

        this.rawInbound = data.rawInbound;
        this.tag = data.tag;
    }
}
