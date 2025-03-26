export class KeygenResponseModel {
    public pubKey: string;
    public payload: string;

    constructor(payload: string) {
        this.pubKey = payload;
    }
}
