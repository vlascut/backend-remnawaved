import { CreateHostCommand } from '@libs/contracts/commands';
import { createZodDto } from 'nestjs-zod';

export class CreateHostRequestDto extends createZodDto(CreateHostCommand.RequestSchema) {}
export class CreateHostResponseDto extends createZodDto(CreateHostCommand.ResponseSchema) {}
