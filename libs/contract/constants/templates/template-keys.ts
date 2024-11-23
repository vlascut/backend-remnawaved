export const TEMPLATE_KEYS = ['DAYS_LEFT', 'TRAFFIC_USED', 'TRAFFIC_LEFT', 'STATUS'] as const;
export type TemplateKeys = (typeof TEMPLATE_KEYS)[number];
