export class InfraAvailableBillingNodeEntity {
    public readonly uuid: string;
    public readonly name: string;
    public readonly countryCode: string;

    constructor(billingNode: InfraAvailableBillingNodeEntity) {
        this.uuid = billingNode.uuid;
        this.name = billingNode.name;
        this.countryCode = billingNode.countryCode;
    }
}
