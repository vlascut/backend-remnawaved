import { TBillingNodeNotificationType } from '../interfaces';

export class InfraBillingNodeNotificationEntity {
    public readonly nodeName: string;
    public readonly providerName: string;
    public readonly loginUrl: string | null;
    public readonly nextBillingAt: Date;
    public readonly notificationType?: TBillingNodeNotificationType;

    constructor(billingNode: InfraBillingNodeNotificationEntity) {
        this.nodeName = billingNode.nodeName;
        this.providerName = billingNode.providerName;
        this.loginUrl = billingNode.loginUrl;
        this.nextBillingAt = billingNode.nextBillingAt;
        this.notificationType = billingNode.notificationType;
    }
}
