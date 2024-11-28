import { z } from 'zod';
import { REST_API } from '../../api';
import { ALPN_VALUES } from '../../constants/hosts/alpn';
import { FINGERPRINTS_VALUES } from '../../constants/hosts/fingerprints';
import { HostsSchema } from '../../models';

export namespace CreateHostCommand {
    export const url = REST_API.HOSTS.CREATE;

    export const RequestSchema = z.object({
        inboundUuid: z
            .string({
                invalid_type_error: 'Inbound UUID must be a string',
            })
            .uuid('Inbound UUID must be a valid UUID'),
        remark: z
            .string({
                invalid_type_error: 'Remark must be a string',
            })
            .max(40, {
                message: 'Remark must be less than 40 characters',
            }),
        address: z.string({
            invalid_type_error: 'Address must be a string',
        }),
        port: z
            .number({
                invalid_type_error: 'Port must be an integer',
            })
            .int(),
        path: z.string().optional(),
        sni: z.string().optional(),
        host: z.string().optional(),
        alpn: z.optional(z.enum([ALPN_VALUES[0], ...ALPN_VALUES]).nullable()),
        fingerprint: z.optional(
            z.enum([FINGERPRINTS_VALUES[0], ...FINGERPRINTS_VALUES]).nullable(),
        ),
        allowInsecure: z.optional(z.boolean().default(false)),
        isDisabled: z.optional(z.boolean().default(false)),
    });
    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: HostsSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
