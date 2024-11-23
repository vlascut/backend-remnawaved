export const SUBSCRIPTION_CONFIG_TYPES = {
    CLASH_META: {
        NAME: 'CLASH_META',
        REGEX: /^(FlClash|clash-verge|clash-?meta|surge)/,
        CONTENT_TYPE: 'text/yaml',
        BASE64: false,
    },
    CLASH: {
        NAME: 'CLASH',
        REGEX: /^[Cc]lash/,
        CONTENT_TYPE: 'text/yaml',
        BASE64: false,
    },
    STASH: {
        NAME: 'STASH',
        REGEX: /^[Ss]tash/,
        CONTENT_TYPE: 'text/yaml',
        BASE64: false,
    },
    SING_BOX: {
        NAME: 'SING_BOX',
        REGEX: /^(SFA|SFI|SFM|SFT|[Kk]aring|Singbox)/,
        CONTENT_TYPE: 'application/json',
        BASE64: false,
    },
    // OUTLINE: {
    //     NAME: 'OUTLINE',
    //     REGEX: /^(SS|SSR|SSD|SSS|Outline|Shadowsocks|SSconf)/,
    //     CONTENT_TYPE: 'application/json',
    //     BASE64: false,
    // },
    XRAY: {
        NAME: 'XRAY',
        REGEX: null,
        CONTENT_TYPE: 'text/plain',
        BASE64: true,
    },
} as const;

export type TSubscriptionConfigTypes = [keyof typeof SUBSCRIPTION_CONFIG_TYPES][number];
export const SUBSCRIPTION_CONFIG_TYPES_VALUES = Object.values(SUBSCRIPTION_CONFIG_TYPES);
