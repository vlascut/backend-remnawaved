export const TEMPLATE_KEYS = [
    'DAYS_LEFT',
    'TRAFFIC_USED',
    'TRAFFIC_LEFT',
    'STATUS',
    'TOTAL_TRAFFIC',
] as const;
export type TemplateKeys = (typeof TEMPLATE_KEYS)[number];
