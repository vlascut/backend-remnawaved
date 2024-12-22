export interface BalancerObject {
    selector: string[];
    strategy?: {
        settings?: any;
        type: string;
    };
    tag: string;
}

export interface DefaultObject {
    alterId: number;
    level: number;
}

export interface DetourObject {
    to: string;
}

export interface DnsObject {
    clientIp?: string;
    disableCache?: boolean;
    disableFallback?: boolean;
    hosts?: { [key: string]: string };
    queryStrategy?: string;
    servers?: (ServerObject | string)[];
    tag?: string;
}

export interface FallbackObject {
    alpn?: string;
    dest?: number | string;
    path?: string;
    xver?: number;
}

export interface RoutingObject {
    balancers?: BalancerObject[];
    domainMatcher?: string;
    domainStrategy?: string;
    rules: RuleObject[];
}

export interface RuleObject {
    attrs?: string;
    balancerTag?: string;
    domain?: string[];
    inboundTag?: string[];
    ip?: string[];
    network?: string;
    outboundTag?: string;
    port?: number | string;
    protocol?: string[];
    source?: string[];
    sourcePort?: number | string;
    type: string;
    user?: string[];
}

export interface ServerObject {
    address: string;
    clientIP?: string;
    domains?: string[];
    expectIPs?: string[];
    port?: number;
    skipFallback?: boolean;
}
