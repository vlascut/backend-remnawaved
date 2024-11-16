import { KeygenEntity } from '../entities/keygen.entity';

export class KeygenResponseModel {
    public pubKey: string;

    constructor(keygenEntity: KeygenEntity) {
        this.pubKey = keygenEntity.pubKey;
    }
}
