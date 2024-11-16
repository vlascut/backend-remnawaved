import { TRolesKeys } from '@libs/contracts/constants';

export interface IJWTAuthPayload {
    username: string | null;
    uuid: string | null;
    role: TRolesKeys;
}
