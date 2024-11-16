import { createZodDto } from 'nestjs-zod';
import { DeleteApiTokenCommand } from '@libs/contracts/commands';

export class DeleteApiTokenResponseDto extends createZodDto(DeleteApiTokenCommand.ResponseSchema) {}
export class DeleteApiTokenRequestDto extends createZodDto(DeleteApiTokenCommand.RequestSchema) {}
