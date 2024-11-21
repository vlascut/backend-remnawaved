import { DnsObject, RoutingObject } from './routing.config';
import { InboundObject, OutboundObject } from './protocols.config';
import { TransportObject } from './transport.config';

export interface PolicyObject {
    levels?: {
        [key: string]: {
            handshake?: number;
            connIdle?: number;
            uplinkOnly?: number;
            downlinkOnly?: number;
            statsUserUplink?: boolean;
            statsUserDownlink?: boolean;
            bufferSize?: number;
        };
    };
    system?: {
        statsInboundUplink?: boolean;
        statsInboundDownlink?: boolean;
        statsOutboundUplink?: boolean;
        statsOutboundDownlink?: boolean;
    };
}

export interface FakeDnsObject {
    ipPool?: string;
    poolSize?: number;
}

export interface IXrayConfig {
    log?: LogObject;
    api?: ApiObject;
    dns?: DnsObject;
    routing?: RoutingObject;
    policy?: PolicyObject;
    inbounds: InboundObject[];
    outbounds: OutboundObject[];
    transport?: TransportObject;
    stats?: StatsObject;
    reverse?: ReverseObject;
    fakedns?: FakeDnsObject;
}

export interface LogObject {
    access?: string;
    error?: string;
    loglevel?: 'debug' | 'info' | 'warning' | 'error' | 'none';
}

export interface ApiObject {
    tag?: string;
    services?: string[];
}

export interface StatsObject {
    // Empty object as per docs
}

export interface ReverseObject {
    bridges?: BridgeObject[];
    portals?: PortalObject[];
}

export interface BridgeObject {
    tag: string;
    domain: string;
}

export interface PortalObject {
    tag: string;
    domain: string;
}
