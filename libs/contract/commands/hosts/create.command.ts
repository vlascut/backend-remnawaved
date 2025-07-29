import { z } from 'zod';

import { getEndpointDetails, FINGERPRINTS, SECURITY_LAYERS, ALPN } from '../../constants';
import { HOSTS_ROUTES, REST_API } from '../../api';
import { HostsSchema } from '../../models';

export namespace CreateHostCommand {
    export const url = REST_API.HOSTS.CREATE;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        HOSTS_ROUTES.CREATE,
        'post',
        'Create a new host',
    );

    export const RequestSchema = z.object({
        inbound: z.object({
            configProfileUuid: z.string().uuid(),
            configProfileInboundUuid: z.string().uuid(),
        }),
        remark: z
            .string({
                invalid_type_error: 'Remark must be a string',
            })
            .min(1, {
                message: 'Remark must be at least 1 character',
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
        alpn: z.optional(z.nativeEnum(ALPN).nullable()),
        fingerprint: z.optional(z.nativeEnum(FINGERPRINTS).nullable()),
        isDisabled: z.optional(z.boolean().default(false)),
        securityLayer: z.optional(z.nativeEnum(SECURITY_LAYERS).default(SECURITY_LAYERS.DEFAULT)),
        xHttpExtraParams: z.optional(z.nullable(z.unknown())),
        serverDescription: z.optional(
            z
                .string()
                .max(30, {
                    message: 'Server description must be less than 30 characters',
                })
                .nullable(),
        ),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: HostsSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
