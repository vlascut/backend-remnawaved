export class RegisterResponseModel {
    public readonly accessToken: string;

    constructor(data: RegisterResponseModel) {
        this.accessToken = data.accessToken;
    }
}
