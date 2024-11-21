export interface TcpObject {
    acceptProxyProtocol?: boolean;
    header?: {
        type: string;
        request?: {
            version?: string;
            method?: string;
            path?: string[];
            headers?: Record<string, string[]>;
        };
        response?: {
            version?: string;
            status?: string;
            reason?: string;
            headers?: Record<string, string[]>;
        };
    };
}

export interface KcpObject {
    mtu?: number;
    tti?: number;
    uplinkCapacity?: number;
    downlinkCapacity?: number;
    congestion?: boolean;
    readBufferSize?: number;
    writeBufferSize?: number;
    header?: {
        type?: string;
    };
    seed?: string;
}

export interface WebSocketObject {
    acceptProxyProtocol?: boolean;
    path?: string;
    headers?: Record<string, string>;
}

export interface HttpObject {
    host?: string[];
    path?: string;
}

export interface QuicObject {
    security?: string;
    key?: string;
    header?: {
        type?: string;
    };
}

export interface DomainSocketObject {
    path: string;
    abstract?: boolean;
    padding?: boolean;
}

export interface GRPCObject {
    serviceName?: string;
    multiMode?: boolean;
}

export interface RealityObject {
    show?: boolean;
    dest?: string;
    xver?: number;
    serverNames?: string[];
    privateKey?: string;
    minClientVer?: string;
    maxClientVer?: string;
    maxTimeDiff?: number;
    shortIds?: string[];
}

export interface TransportObject {
    tcpSettings?: TcpObject;
    kcpSettings?: KcpObject;
    wsSettings?: WebSocketObject;
    httpSettings?: HttpObject;
    quicSettings?: QuicObject;
    dsSettings?: DomainSocketObject;
    grpcSettings?: GRPCObject;
}

export interface StreamSettingsObject {
    network?: 'tcp' | 'kcp' | 'ws' | 'http' | 'domainsocket' | 'quic' | 'grpc';
    security?: 'none' | 'tls' | 'reality';
    tlsSettings?: TLSObject;
    realitySettings?: RealityObject;
    tcpSettings?: TcpObject;
    kcpSettings?: KcpObject;
    wsSettings?: WebSocketObject;
    httpSettings?: HttpObject;
    quicSettings?: QuicObject;
    grpcSettings?: GRPCObject;
    dsSettings?: DomainSocketObject;
    sockopt?: SockoptObject;
}

export interface TLSObject {
    serverName?: string;
    rejectUnknownSni?: boolean;
    allowInsecure?: boolean;
    alpn?: string[];
    minVersion?: string;
    maxVersion?: string;
    cipherSuites?: string;
    certificates?: CertificateObject[];
    disableSystemRoot?: boolean;
    enableSessionResumption?: boolean;
    fingerprint?: string;
    pinnedPeerCertificateChainSha256?: string[];
}

export interface CertificateObject {
    ocspStapling?: number;
    oneTimeLoading?: boolean;
    usage?: string;
    certificateFile?: string;
    keyFile?: string;
    certificate?: string[];
    key?: string[];
}

export interface SockoptObject {
    mark?: number;
    tcpFastOpen?: boolean;
    tproxy?: 'redirect' | 'tproxy' | 'off';
    domainStrategy?: 'AsIs' | 'UseIP' | 'UseIPv4' | 'UseIPv6';
    dialerProxy?: string;
    acceptProxyProtocol?: boolean;
    tcpKeepAliveInterval?: number;
    tcpKeepAliveIdle?: number;
    tcpUserTimeout?: number;
    tcpcongestion?: string;
    interface?: string;
    V6Only?: boolean;
}
