import { createZodDto } from 'nestjs-zod';
import { CreateApiTokenCommand } from '@libs/contracts/commands';

export class CreateApiTokenResponseDto extends createZodDto(CreateApiTokenCommand.ResponseSchema) {}
export class CreateApiTokenRequestDto extends createZodDto(CreateApiTokenCommand.RequestSchema) {}
