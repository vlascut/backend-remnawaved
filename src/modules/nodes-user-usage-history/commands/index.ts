import { UpsertUserHistoryEntryHandler } from './upsert-user-history-entry';
import { BulkUpsertUserHistoryEntryHandler } from './bulk-upsert-user-history-entry';

export const COMMANDS = [UpsertUserHistoryEntryHandler, BulkUpsertUserHistoryEntryHandler];
