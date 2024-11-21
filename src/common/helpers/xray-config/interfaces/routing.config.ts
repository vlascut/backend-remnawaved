export interface DnsObject {
    hosts?: { [key: string]: string };
    servers?: (string | ServerObject)[];
    clientIp?: string;
    tag?: string;
    queryStrategy?: string;
    disableCache?: boolean;
    disableFallback?: boolean;
}

export interface ServerObject {
    address: string;
    port?: number;
    domains?: string[];
    expectIPs?: string[];
    skipFallback?: boolean;
    clientIP?: string;
}

export interface RoutingObject {
    domainStrategy?: string;
    domainMatcher?: string;
    rules: RuleObject[];
    balancers?: BalancerObject[];
}

export interface RuleObject {
    type: string;
    domain?: string[];
    ip?: string[];
    port?: string | number;
    sourcePort?: string | number;
    network?: string;
    source?: string[];
    user?: string[];
    inboundTag?: string[];
    protocol?: string[];
    attrs?: string;
    outboundTag?: string;
    balancerTag?: string;
}

export interface BalancerObject {
    tag: string;
    selector: string[];
    strategy?: {
        type: string;
        settings?: any;
    };
}

export interface DefaultObject {
    level: number;
    alterId: number;
}

export interface DetourObject {
    to: string;
}

export interface FallbackObject {
    alpn?: string;
    path?: string;
    dest?: string | number;
    xver?: number;
}
