import { ApiTokenEntity } from '../entities/api-token.entity';

export class FindAllApiTokensResponseModel {
    public uuid: string;
    public token: string;
    public tokenName: string;
    public tokenDescription: null | string;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(data: ApiTokenEntity) {
        this.uuid = data.uuid;
        this.token = data.token;
        this.tokenName = data.tokenName;
        this.tokenDescription = data.tokenDescription;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
