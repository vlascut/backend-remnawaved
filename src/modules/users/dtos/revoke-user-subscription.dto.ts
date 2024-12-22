import { createZodDto } from 'nestjs-zod';

import { RevokeUserSubscriptionCommand } from '@libs/contracts/commands';

export class RevokeUserSubscriptionRequestDto extends createZodDto(
    RevokeUserSubscriptionCommand.RequestSchema,
) {}
export class RevokeUserSubscriptionResponseDto extends createZodDto(
    RevokeUserSubscriptionCommand.ResponseSchema,
) {}
