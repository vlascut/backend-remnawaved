import { createZodDto } from 'nestjs-zod';
import { GetAllUsersV2Command } from '@libs/contracts/commands';

export class GetAllUsersV2ResponseDto extends createZodDto(GetAllUsersV2Command.ResponseSchema) {}
export class GetAllUsersV2QueryDto extends createZodDto(GetAllUsersV2Command.RequestQuerySchema) {}
