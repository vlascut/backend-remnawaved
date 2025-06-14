import { TruncateUserTrafficHistoryHandler } from './truncate-user-traffic-history';
import { CreateUserTrafficHistoryHandler } from './create-user-traffic-history';

export const COMMANDS = [CreateUserTrafficHistoryHandler, TruncateUserTrafficHistoryHandler];
