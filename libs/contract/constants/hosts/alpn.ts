export const ALPN = {
    HTTP_1_1: 'http/1.1',
    H2: 'h2',
    H_COMBINED: 'h2,http/1.1',
} as const;

export type TAlpn = [keyof typeof ALPN][number];
export const ALPN_VALUES = Object.values(ALPN);
