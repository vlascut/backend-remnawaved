import { z } from 'zod';

import { SUBSCRIPTION_TEMPLATE_TYPE } from '../../constants';
import { REST_API } from '../../api';

export namespace UpdateSubscriptionTemplateCommand {
    export const url = REST_API.SUBSCRIPTION_TEMPLATE.UPDATE_TEMPLATE;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        templateType: z.nativeEnum(SUBSCRIPTION_TEMPLATE_TYPE),
        templateJson: z.optional(z.object({}).passthrough()),
        encodedTemplateYaml: z.optional(z.string()),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            uuid: z.string().uuid(),
            templateType: z.nativeEnum(SUBSCRIPTION_TEMPLATE_TYPE),
            templateJson: z.nullable(z.unknown()),
            encodedTemplateYaml: z.nullable(z.string()),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
