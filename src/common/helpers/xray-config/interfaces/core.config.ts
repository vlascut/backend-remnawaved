import { InboundObject, OutboundObject } from './protocols.config';
import { DnsObject, RoutingObject } from './routing.config';
import { TransportObject } from './transport.config';

export interface ApiObject {
    services?: string[];
    tag?: string;
}

export interface BridgeObject {
    domain: string;
    tag: string;
}

export interface FakeDnsObject {
    ipPool?: string;
    poolSize?: number;
}

export interface IXrayConfig {
    api?: ApiObject;
    dns?: DnsObject;
    fakedns?: FakeDnsObject;
    inbounds: InboundObject[];
    log?: LogObject;
    outbounds: OutboundObject[];
    policy?: PolicyObject;
    reverse?: ReverseObject;
    routing?: RoutingObject;
    stats?: StatsObject;
    transport?: TransportObject;
}

export interface LogObject {
    access?: string;
    error?: string;
    loglevel?: 'debug' | 'error' | 'info' | 'none' | 'warning';
}

export interface PolicyObject {
    levels?: {
        [key: string]: {
            bufferSize?: number;
            connIdle?: number;
            downlinkOnly?: number;
            handshake?: number;
            statsUserDownlink?: boolean;
            statsUserUplink?: boolean;
            uplinkOnly?: number;
        };
    };
    system?: {
        statsInboundDownlink?: boolean;
        statsInboundUplink?: boolean;
        statsOutboundDownlink?: boolean;
        statsOutboundUplink?: boolean;
    };
}

export interface PortalObject {
    domain: string;
    tag: string;
}

export interface ReverseObject {
    bridges?: BridgeObject[];
    portals?: PortalObject[];
}

export type StatsObject = object;
