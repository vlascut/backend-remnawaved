import { TemplateKeys } from '@libs/contracts/constants/templates/template-keys';

type TemplateValues = {
    [key in TemplateKeys]: number | string | undefined;
};

export class TemplateEngine {
    static replace(template: string, values: TemplateValues): string {
        let hasReplacement = false;
        const result = template.replace(/\{\{(\w+)\}\}/g, (match, key: TemplateKeys) => {
            if (values[key] !== undefined) {
                hasReplacement = true;
                return values[key]?.toString() || '';
            }
            return match;
        });

        return hasReplacement ? result : template;
    }
}
