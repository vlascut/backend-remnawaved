import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApiTokensModule } from './api-tokens/api-tokens.module';
import { KeygenModule } from './keygen/keygen.module';
import { NodesModule } from './nodes/nodes.module';
import { NodesTrafficUsageHistoryModule } from './nodes-traffic-usage-history/nodes-traffic-usage-history.module';
import { NodesUserUsageHistoryModule } from './nodes-user-usage-history/nodes-user-usage-history.module';
import { NodesUsageHistoryModule } from './nodes-usage-history/nodes-usage-history.module';
import { XrayConfigModule } from './xray-config';
import { InboundsModule } from './inbounds/inbounds.module';
import { JobsModule } from './jobs/jobs.module';
import { UserTrafficHistoryModule } from './user-traffic-history/user-traffic-history.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { HostsModule } from './hosts/hosts.module';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        SubscriptionModule,
        ApiTokensModule,
        KeygenModule,
        NodesModule,
        NodesTrafficUsageHistoryModule,
        HostsModule,
        UserTrafficHistoryModule,
        NodesUserUsageHistoryModule,
        NodesUsageHistoryModule,
        InboundsModule,
        XrayConfigModule,
        JobsModule,
    ],
})
export class RemnawaveModules {}
