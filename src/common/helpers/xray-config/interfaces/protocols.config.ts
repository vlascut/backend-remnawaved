import { StreamSettingsObject } from './transport.config';
import {
    VMessSettings,
    VLessSettings,
    TrojanSettings,
    ShadowsocksSettings,
    DokodemoSettings,
    SocksSettings,
    HttpSettings,
    FreedomSettings,
    BlackholeSettings,
    DnsSettings,
} from './protocol-settings.config';

import { DefaultObject, DetourObject, FallbackObject } from './routing.config';

export interface InboundObject {
    port: number | string;
    listen?: string;
    protocol: 'vmess' | 'vless' | 'trojan' | 'shadowsocks' | 'dokodemo-door' | 'socks' | 'http';
    settings?: InboundSettings;
    streamSettings?: StreamSettingsObject;
    tag: string;
    sniffing?: {
        enabled?: boolean;
        destOverride?: string[];
    };
    allocate?: {
        strategy?: string;
        refresh?: number;
        concurrency?: number;
    };
}

export interface OutboundObject {
    sendThrough?: string;
    protocol: 'vmess' | 'vless' | 'freedom' | 'blackhole' | 'dns' | 'trojan' | 'shadowsocks';
    settings?: OutboundSettings;
    tag?: string;
    streamSettings?: StreamSettingsObject;
    proxySettings?: {
        tag?: string;
        transportLayer?: boolean;
    };
    mux?: MuxObject;
}

export interface MuxObject {
    enabled?: boolean;
    concurrency?: number;
}

// Protocol-specific settings interfaces
export interface VMessInboundSettings {
    clients: VMessClientObject[];
    default?: DefaultObject;
    detour?: DetourObject;
}

export interface VMessClientObject {
    id: string;
    level?: number;
    email?: string;
    flow?: string;
}

export interface VLessInboundSettings {
    clients: VLessClientObject[];
    decryption: 'none';
    fallbacks?: FallbackObject[];
}

export interface VLessClientObject {
    id: string;
    level?: number;
    email?: string;
    flow?: string;
}

export interface ShadowsocksInboundSettings {
    email?: string;
    method: string;
    password: string;
    level?: number;
    network?: string;
    uot?: boolean;
    UoTVersion?: number;
}

// Union type для всех возможных входящих настроек
export type InboundSettings =
    | VMessSettings
    | VLessSettings
    | TrojanSettings
    | ShadowsocksSettings
    | DokodemoSettings
    | SocksSettings
    | HttpSettings;

// Union type для всех возможных исходящих настроек
export type OutboundSettings =
    | VMessSettings
    | VLessSettings
    | FreedomSettings
    | BlackholeSettings
    | DnsSettings
    | TrojanSettings
    | ShadowsocksSettings;
