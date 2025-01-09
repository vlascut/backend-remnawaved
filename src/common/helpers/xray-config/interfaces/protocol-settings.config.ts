// Blackhole Protocol Settings
export interface BlackholeSettings {
    response?: {
        type: 'dns' | 'http' | 'none';
    };
}

// DNS Protocol Settings
export interface DnsSettings {
    address?: string;
    network?: 'tcp' | 'udp';
    port?: number;
}

// Dokodemo-door Protocol Settings
export interface DokodemoSettings {
    address?: string;
    followRedirect?: boolean;
    network?: 'tcp' | 'tcp,udp' | 'udp';
    port?: number;
    timeout?: number;
    userLevel?: number;
}

// Freedom Protocol Settings
export interface FreedomSettings {
    domainStrategy?: 'AsIs' | 'UseIP' | 'UseIPv4' | 'UseIPv6';
    redirect?: string;
    userLevel?: number;
}

export interface HttpAccount {
    pass: string;
    user: string;
}

// HTTP Protocol Settings
export interface HttpSettings {
    accounts?: HttpAccount[];
    allowTransparent?: boolean;
    timeout?: number;
    userLevel?: number;
}

// Shadowsocks Protocol Settings
export interface ShadowsocksSettings {
    clients: ShadowsocksUser[];
}

export interface ShadowsocksUser extends UserObject {
    method: string;
    password: string;
}

export interface SocksAccount {
    pass: string;
    user: string;
}

// Socks Protocol Settings
export interface SocksSettings {
    accounts?: SocksAccount[];
    auth?: 'noauth' | 'password';
    ip?: string;
    udp?: boolean;
    userLevel?: number;
}

export interface TrojanFallback {
    alpn?: string;
    dest?: number | string;
    path?: string;
    xver?: number;
}

// Trojan Protocol Settings
export interface TrojanSettings {
    clients: TrojanUser[];
    fallbacks?: TrojanFallback[];
}

export interface TrojanUser extends UserObject {
    flow?: string;
    password: string;
}

// Common interfaces
export interface UserObject {
    email?: string;
    level?: number;
}

export interface VLessFallback {
    alpn?: string;
    dest?: number | string;
    path?: string;
    xver?: number;
}

// VLess Protocol Settings
export interface VLessSettings {
    clients: VLessUser[];
    decryption: 'none';
    fallbacks?: VLessFallback[];
}

export interface VLessUser extends UserObject {
    encryption?: string;
    flow?: 'xtls-rprx-direct' | 'xtls-rprx-origin' | 'xtls-rprx-vision';
    id: string;
}

// VMess Protocol Settings
export interface VMessSettings {
    clients: VMessUser[];
    default?: {
        alterId: number;
        level: number;
    };
    detour?: {
        to: string;
    };
    disableInsecureEncryption?: boolean;
}

export interface VMessUser extends UserObject {
    alterId?: number;
    security?: 'aes-128-gcm' | 'auto' | 'chacha20-poly1305' | 'none' | 'zero';
}
