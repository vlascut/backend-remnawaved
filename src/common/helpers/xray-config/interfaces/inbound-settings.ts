export interface InboundSettings {
    tag: string;
    protocol: string;
    port?: number | null;
    network: string;
    tls: string;
    sni: string[];
    host: string[];
    path: string;
    headerType: string;
}
