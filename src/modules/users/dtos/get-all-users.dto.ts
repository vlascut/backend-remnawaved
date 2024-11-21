import { createZodDto } from 'nestjs-zod';
import { GetAllUsersCommand } from '@libs/contracts/commands';

export class GetAllUsersResponseDto extends createZodDto(GetAllUsersCommand.ResponseSchema) {}
export class GetAllUsersQueryDto extends createZodDto(GetAllUsersCommand.RequestQuerySchema) {}
