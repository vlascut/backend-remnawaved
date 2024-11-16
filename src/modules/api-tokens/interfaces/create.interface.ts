export interface ICreateApiTokenRequest {
    tokenName: string;
    tokenDescription: string | null;
}

export interface ICreateApiTokenResponse {
    uuid: string;
    token: string;
}
