import { GetSubscriptionInfoByShortUuidCommand } from '@libs/contracts/commands/subscription';
import { createZodDto } from 'nestjs-zod';

export class GetSubscriptionInfoRequestDto extends createZodDto(
    GetSubscriptionInfoByShortUuidCommand.RequestSchema,
) {}
export class GetSubscriptionInfoResponseDto extends createZodDto(
    GetSubscriptionInfoByShortUuidCommand.ResponseSchema,
) {}
