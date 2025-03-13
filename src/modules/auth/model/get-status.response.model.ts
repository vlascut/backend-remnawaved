export class GetStatusResponseModel {
    public readonly isLoginAllowed: boolean;
    public readonly isRegisterAllowed: boolean;

    constructor(data: { isLoginAllowed: boolean; isRegisterAllowed: boolean }) {
        this.isLoginAllowed = data.isLoginAllowed;
        this.isRegisterAllowed = data.isRegisterAllowed;
    }
}
