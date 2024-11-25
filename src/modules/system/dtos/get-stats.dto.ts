import { createZodDto } from 'nestjs-zod';
import { GetStatsCommand } from '@contract/commands';

export class GetStatsResponseDto extends createZodDto(GetStatsCommand.ResponseSchema) {}
