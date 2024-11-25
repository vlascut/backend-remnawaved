import { Module } from '@nestjs/common';
import { ApiTokensModule } from './api-tokens/api-tokens.module';
import { AuthModule } from './auth/auth.module';
import { HostsModule } from './hosts/hosts.module';
import { InboundsModule } from './inbounds/inbounds.module';
import { JobsModule } from './jobs/jobs.module';
import { KeygenModule } from './keygen/keygen.module';
import { NodesTrafficUsageHistoryModule } from './nodes-traffic-usage-history/nodes-traffic-usage-history.module';
import { NodesUsageHistoryModule } from './nodes-usage-history/nodes-usage-history.module';
import { NodesUserUsageHistoryModule } from './nodes-user-usage-history/nodes-user-usage-history.module';
import { NodesModule } from './nodes/nodes.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserTrafficHistoryModule } from './user-traffic-history/user-traffic-history.module';
import { UsersModule } from './users/users.module';
import { XrayConfigModule } from './xray-config';
import { SystemModule } from './system/system.module';

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
        SystemModule,
    ],
})
export class RemnawaveModules {}
