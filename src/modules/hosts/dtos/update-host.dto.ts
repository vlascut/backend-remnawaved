import { UpdateHostCommand } from '@libs/contracts/commands';
import { createZodDto } from 'nestjs-zod';

export class UpdateHostRequestDto extends createZodDto(UpdateHostCommand.RequestSchema) {}
export class UpdateHostResponseDto extends createZodDto(UpdateHostCommand.ResponseSchema) {}
