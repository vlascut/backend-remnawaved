import { ConfigProfileInboundEntity } from '@modules/config-profiles/entities';

export class UserWithResolvedInboundEntity {
    public userUuid: string;
    public username: string;
    public trojanPassword: string;
    public vlessUuid: string;
    public ssPassword: string;

    public inbounds: ConfigProfileInboundEntity[];

    constructor(data: UserWithResolvedInboundEntity) {
        this.userUuid = data.userUuid;
        this.username = data.username;
        this.trojanPassword = data.trojanPassword;
        this.vlessUuid = data.vlessUuid;
        this.ssPassword = data.ssPassword;
        this.inbounds = data.inbounds;
    }
}
