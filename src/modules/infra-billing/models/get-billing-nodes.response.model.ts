import { InfraAvailableBillingNodeEntity, InfraBillingNodeEntity } from '../entities';

export class GetBillingNodesResponseModel {
    public readonly totalBillingNodes: number;
    public readonly totalAvailableBillingNodes: number;
    public readonly billingNodes: InfraBillingNodeEntity[];
    public readonly availableBillingNodes: InfraAvailableBillingNodeEntity[];
    public readonly stats: {
        upcomingNodesCount: number;
        currentMonthPayments: number;
        totalSpent: number;
    };
    constructor(
        billingNodes: InfraBillingNodeEntity[],
        availableBillingNodes: InfraAvailableBillingNodeEntity[],
        totalBillingNodes: number,
        totalAvailableBillingNodes: number,
        stats: {
            upcomingNodesCount: number;
            currentMonthPayments: number;
            totalSpent: number;
        },
    ) {
        this.totalBillingNodes = totalBillingNodes;
        this.totalAvailableBillingNodes = totalAvailableBillingNodes;
        this.billingNodes = billingNodes;
        this.availableBillingNodes = availableBillingNodes;
        this.stats = stats;
    }
}
