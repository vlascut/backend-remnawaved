// Common interfaces
export interface UserObject {
    email?: string;
    level?: number;
}

// VMess Protocol Settings
export interface VMessSettings {
    clients: VMessUser[];
    default?: {
        level: number;
        alterId: number;
    };
    detour?: {
        to: string;
    };
    disableInsecureEncryption?: boolean;
}

export interface VMessUser extends UserObject {
    alterId?: number;
    security?: 'aes-128-gcm' | 'chacha20-poly1305' | 'auto' | 'none' | 'zero';
}

// VLess Protocol Settings
export interface VLessSettings {
    clients: VLessUser[];
    decryption: 'none';
    fallbacks?: VLessFallback[];
}

export interface VLessUser extends UserObject {
    id: string;
    flow?: 'xtls-rprx-direct' | 'xtls-rprx-origin' | 'xtls-rprx-vision';
    encryption?: string;
}

export interface VLessFallback {
    alpn?: string;
    path?: string;
    dest?: string | number;
    xver?: number;
}

// Shadowsocks Protocol Settings
export interface ShadowsocksSettings {
    method: string;
    password: string;
    level?: number;
    network?: 'tcp' | 'udp' | 'tcp,udp';
    ivCheck?: boolean;
}

// Trojan Protocol Settings
export interface TrojanSettings {
    clients: TrojanUser[];
    fallbacks?: TrojanFallback[];
}

export interface TrojanUser extends UserObject {
    password: string;
    flow?: string;
}

export interface TrojanFallback {
    alpn?: string;
    path?: string;
    dest?: string | number;
    xver?: number;
}

// Socks Protocol Settings
export interface SocksSettings {
    auth?: 'password' | 'noauth';
    accounts?: SocksAccount[];
    udp?: boolean;
    ip?: string;
    userLevel?: number;
}

export interface SocksAccount {
    user: string;
    pass: string;
}

// HTTP Protocol Settings
export interface HttpSettings {
    timeout?: number;
    accounts?: HttpAccount[];
    allowTransparent?: boolean;
    userLevel?: number;
}

export interface HttpAccount {
    user: string;
    pass: string;
}

// Dokodemo-door Protocol Settings
export interface DokodemoSettings {
    address?: string;
    port?: number;
    network?: 'tcp' | 'udp' | 'tcp,udp';
    timeout?: number;
    followRedirect?: boolean;
    userLevel?: number;
}

// Freedom Protocol Settings
export interface FreedomSettings {
    domainStrategy?: 'AsIs' | 'UseIP' | 'UseIPv4' | 'UseIPv6';
    redirect?: string;
    userLevel?: number;
}

// Blackhole Protocol Settings
export interface BlackholeSettings {
    response?: {
        type: 'none' | 'http' | 'dns';
    };
}

// DNS Protocol Settings
export interface DnsSettings {
    network?: 'tcp' | 'udp';
    address?: string;
    port?: number;
}
