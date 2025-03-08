import { z } from 'zod';

import { SUBSCRIPTION_TEMPLATE_TYPE } from '../../constants';
import { REST_API } from '../../api';

export namespace GetSubscriptionTemplateCommand {
    export const url = REST_API.SUBSCRIPTION_TEMPLATE.GET_INFO;
    export const TSQ_url = url(':templateType');

    export const RequestSchema = z.object({
        templateType: z.nativeEnum(SUBSCRIPTION_TEMPLATE_TYPE),
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
