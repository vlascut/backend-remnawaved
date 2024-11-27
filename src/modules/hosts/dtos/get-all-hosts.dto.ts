import { GetAllHostsCommand } from '@libs/contracts/commands';
import { createZodDto } from 'nestjs-zod';

export class GetAllHostsResponseDto extends createZodDto(GetAllHostsCommand.ResponseSchema) {}
