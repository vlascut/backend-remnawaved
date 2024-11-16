import { createZodDto } from 'nestjs-zod';
import { LoginCommand } from '@libs/contracts/commands';

export class LoginResponseDto extends createZodDto(LoginCommand.ResponseSchema) {}
export class LoginRequestDto extends createZodDto(LoginCommand.RequestSchema) {}
