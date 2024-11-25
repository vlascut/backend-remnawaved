import { DeleteHostCommand } from '@libs/contracts/commands';
import { createZodDto } from 'nestjs-zod';

export class DeleteHostRequestDto extends createZodDto(DeleteHostCommand.RequestSchema) {}
export class DeleteHostResponseDto extends createZodDto(DeleteHostCommand.ResponseSchema) {}
