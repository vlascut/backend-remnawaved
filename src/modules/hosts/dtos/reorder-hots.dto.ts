import { ReorderHostCommand } from '@libs/contracts/commands';
import { createZodDto } from 'nestjs-zod';

export class ReorderHostRequestDto extends createZodDto(ReorderHostCommand.RequestSchema) {}
export class ReorderHostResponseDto extends createZodDto(ReorderHostCommand.ResponseSchema) {}
