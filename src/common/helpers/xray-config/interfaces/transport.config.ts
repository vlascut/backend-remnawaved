export interface CertificateObject {
    certificate?: string[];
    certificateFile?: string;
    key?: string[];
    keyFile?: string;
    ocspStapling?: number;
    oneTimeLoading?: boolean;
    usage?: string;
}

export interface DomainSocketObject {
    abstract?: boolean;
    padding?: boolean;
    path: string;
}

export interface GRPCObject {
    multiMode?: boolean;
    serviceName?: string;
}

export interface HttpObject {
    host?: string[];
    path?: string;
}

export interface KcpObject {
    congestion?: boolean;
    downlinkCapacity?: number;
    header?: {
        type?: string;
    };
    mtu?: number;
    readBufferSize?: number;
    seed?: string;
    tti?: number;
    uplinkCapacity?: number;
    writeBufferSize?: number;
}

export interface QuicObject {
    header?: {
        type?: string;
    };
    key?: string;
    security?: string;
}

export interface RealityObject {
    dest?: string;
    maxClientVer?: string;
    maxTimeDiff?: number;
    minClientVer?: string;
    privateKey?: string;
    publicKey?: string;
    serverNames?: string[];
    shortIds?: string[];
    show?: boolean;
    spiderX?: string;
    xver?: number;
}

export interface SockoptObject {
    acceptProxyProtocol?: boolean;
    dialerProxy?: string;
    domainStrategy?: 'AsIs' | 'UseIP' | 'UseIPv4' | 'UseIPv6';
    interface?: string;
    mark?: number;
    tcpcongestion?: string;
    tcpFastOpen?: boolean;
    tcpKeepAliveIdle?: number;
    tcpKeepAliveInterval?: number;
    tcpUserTimeout?: number;
    tproxy?: 'off' | 'redirect' | 'tproxy';
    V6Only?: boolean;
}

export interface StreamSettingsObject {
    dsSettings?: DomainSocketObject;
    grpcSettings?: GRPCObject;
    httpSettings?: HttpObject;
    kcpSettings?: KcpObject;
    network?: 'domainsocket' | 'grpc' | 'http' | 'kcp' | 'quic' | 'tcp' | 'ws';
    quicSettings?: QuicObject;
    realitySettings?: RealityObject;
    security?: 'none' | 'reality' | 'tls';
    sockopt?: SockoptObject;
    tcpSettings?: TcpObject;
    tlsSettings?: TLSObject;
    wsSettings?: WebSocketObject;
}

export interface TcpObject {
    acceptProxyProtocol?: boolean;
    header?: {
        request?: {
            headers?: Record<string, string[]>;
            method?: string;
            path?: string[];
            version?: string;
        };
        response?: {
            headers?: Record<string, string[]>;
            reason?: string;
            status?: string;
            version?: string;
        };
        type: string;
    };
}

export interface TLSObject {
    allowInsecure?: boolean;
    alpn?: string[];
    certificates?: CertificateObject[];
    cipherSuites?: string;
    disableSystemRoot?: boolean;
    enableSessionResumption?: boolean;
    fingerprint?: string;
    maxVersion?: string;
    minVersion?: string;
    pinnedPeerCertificateChainSha256?: string[];
    rejectUnknownSni?: boolean;
    serverName?: string;
}

export interface TransportObject {
    dsSettings?: DomainSocketObject;
    grpcSettings?: GRPCObject;
    httpSettings?: HttpObject;
    kcpSettings?: KcpObject;
    quicSettings?: QuicObject;
    tcpSettings?: TcpObject;
    wsSettings?: WebSocketObject;
}

export interface WebSocketObject {
    acceptProxyProtocol?: boolean;
    headers?: Record<string, string>;
    path?: string;
}
