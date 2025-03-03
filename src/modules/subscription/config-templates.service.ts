import { readFileSync } from 'node:fs';
import path from 'node:path';

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { isDevelopment } from '@common/utils/startup-app';

@Injectable()
export class ConfigTemplatesService implements OnModuleInit {
    private readonly logger = new Logger(ConfigTemplatesService.name);
    private templates: Map<string, string> = new Map();

    private readonly templatePaths = {
        CLASH_TEMPLATE: isDevelopment()
            ? path.join(__dirname, '../../../../configs/clash/clash_template.yml')
            : path.join('/var/lib/remnawave/configs/clash/clash_template.yml'),

        STASH_TEMPLATE: isDevelopment()
            ? path.join(__dirname, '../../../../configs/stash/stash_template.yml')
            : path.join('/var/lib/remnawave/configs/stash/stash_template.yml'),

        SINGBOX_TEMPLATE: isDevelopment()
            ? path.join(__dirname, '../../../../configs/singbox/singbox_template.json')
            : path.join('/var/lib/remnawave/configs/singbox/singbox_template.json'),

        SINGBOX_LEGACY_TEMPLATE: isDevelopment()
            ? path.join(__dirname, '../../../../configs/singbox/singbox_legacy.json')
            : path.join('/var/lib/remnawave/configs/singbox/singbox_legacy.json'),
    };

    async onModuleInit() {
        this.logger.log('Initializing configuration templates...');

        const errors: string[] = [];

        for (const [key, path] of Object.entries(this.templatePaths)) {
            try {
                const content = readFileSync(path, 'utf8');
                this.templates.set(key, content);
                this.logger.debug(`Template ${key} successfully loaded`);
            } catch (error) {
                errors.push(`Failed to load template ${key} from ${path}: ${error}`);
            }
        }

        if (errors.length > 0) {
            const errorMessage = [
                'Critical error when loading configuration templates:',
                ...errors,
            ].join('\n');

            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        this.logger.log('All configuration templates have been successfully loaded');
    }

    getTemplate(key: keyof typeof this.templatePaths): string {
        const template = this.templates.get(key);
        if (!template) {
            throw new Error(`Template ${key} not found`);
        }
        return template;
    }
}
