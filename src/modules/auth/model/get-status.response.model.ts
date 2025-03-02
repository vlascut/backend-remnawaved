export class GetStatusResponseModel {
    public readonly isLoginAllowed: boolean;
    public readonly isRegisterAllowed: boolean;

    constructor(data: GetStatusResponseModel) {
        this.isLoginAllowed = data.isLoginAllowed;
        this.isRegisterAllowed = data.isRegisterAllowed;
    }
}
