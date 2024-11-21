// export interface Certificate {
//     certificateFile?: string;
//     keyFile?: string;
//     certificate?: string[];
//     key?: string[];
// }

// export interface TlsSettings {
//     certificates?: Certificate[];
//     minVersion?: string;
//     cipherSuites?: string;
// }

// export interface StreamSettings {
//     network?: string;
//     security?: string;
//     tlsSettings?: TlsSettings;
// }

// export interface Sniffing {
//     enabled?: boolean;
//     destOverride?: string[];
// }

// export interface InboundSettings {
//     clients?: unknown[];
// }

// export interface Inbound {
//     tag: string;
//     protocol: string;
//     port?: number | null;
//     network?: string;
//     tls?: string;
//     sni?: string[];
//     host?: string[];
//     path?: string;
//     headerType?: string;
//     streamSettings?: StreamSettings;
//     sniffing?: Sniffing;
//     settings?: InboundSettings;
// }

// export interface Outbound {
//     protocol?: string;
//     tag?: string;
// }

// export interface IXrayConfig extends Record<string, unknown> {
//     inbounds: Inbound[];
//     outbounds: Outbound[];
//     api?: unknown;
//     stats?: unknown;
//     policy?: unknown;
//     routing?: unknown;
// }
