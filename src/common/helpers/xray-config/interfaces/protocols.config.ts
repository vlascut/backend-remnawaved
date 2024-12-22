import {
    BlackholeSettings,
    DnsSettings,
    DokodemoSettings,
    FreedomSettings,
    HttpSettings,
    ShadowsocksSettings,
    SocksSettings,
    TrojanSettings,
    VLessSettings,
    VMessSettings,
} from './protocol-settings.config';
import { DefaultObject, DetourObject, FallbackObject } from './routing.config';
import { StreamSettingsObject } from './transport.config';

export interface InboundObject {
    allocate?: {
        concurrency?: number;
        refresh?: number;
        strategy?: string;
    };
    listen?: string;
    port: number | string;
    protocol: 'dokodemo-door' | 'http' | 'shadowsocks' | 'socks' | 'trojan' | 'vless' | 'vmess';
    settings?: InboundSettings;
    sniffing?: {
        destOverride?: string[];
        enabled?: boolean;
    };
    streamSettings?: StreamSettingsObject;
    tag: string;
}

// Union type для всех возможных входящих настроек
export type InboundSettings =
    | DokodemoSettings
    | HttpSettings
    | ShadowsocksSettings
    | SocksSettings
    | TrojanSettings
    | VLessSettings
    | VMessSettings;

export interface MuxObject {
    concurrency?: number;
    enabled?: boolean;
}

export interface OutboundObject {
    mux?: MuxObject;
    protocol: 'blackhole' | 'dns' | 'freedom' | 'shadowsocks' | 'trojan' | 'vless' | 'vmess';
    proxySettings?: {
        tag?: string;
        transportLayer?: boolean;
    };
    sendThrough?: string;
    settings?: OutboundSettings;
    streamSettings?: StreamSettingsObject;
    tag?: string;
}

// Union type для всех возможных исходящих настроек
export type OutboundSettings =
    | BlackholeSettings
    | DnsSettings
    | FreedomSettings
    | ShadowsocksSettings
    | TrojanSettings
    | VLessSettings
    | VMessSettings;

export interface ShadowsocksInboundSettings {
    email?: string;
    level?: number;
    method: string;
    network?: string;
    password: string;
    uot?: boolean;
    UoTVersion?: number;
}

export interface VLessClientObject {
    email?: string;
    flow?: string;
    id: string;
    level?: number;
}

export interface VLessInboundSettings {
    clients: VLessClientObject[];
    decryption: 'none';
    fallbacks?: FallbackObject[];
}

export interface VMessClientObject {
    email?: string;
    flow?: string;
    id: string;
    level?: number;
}

// Protocol-specific settings interfaces
export interface VMessInboundSettings {
    clients: VMessClientObject[];
    default?: DefaultObject;
    detour?: DetourObject;
}
