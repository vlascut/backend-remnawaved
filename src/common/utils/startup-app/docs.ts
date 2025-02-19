import { apiReference } from '@scalar/nestjs-api-reference';
import { SwaggerThemeNameEnum } from 'swagger-themes';
import { DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SwaggerTheme } from 'swagger-themes';
import { readPackageJSON } from 'pkg-types';

const description = `
Remnawave is a powerful proxy managment tool, built on top of Xray-core, with a focus on simplicity and ease of use.

## Resources
* https://t.me/remnawave
* https://github.com/remnawave
* https://remna.st
`;

export async function getDocs(app: INestApplication<unknown>, config: ConfigService) {
    const isSwaggerEnabled = config.getOrThrow<string>('IS_DOCS_ENABLED');

    if (isSwaggerEnabled === 'true') {
        const pkg = await readPackageJSON();

        const configSwagger = new DocumentBuilder()
            .setTitle(`Remnawave API v${pkg.version}`)
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    description: 'JWT obtained login.',
                },
                'Authorization',
            )
            .addBasicAuth(
                {
                    type: 'http',
                    scheme: 'basic',
                    name: 'Prometheus',
                    description: 'Prometheus Basic Auth',
                },
                'Prometheus',
            )
            .setDescription(description)
            .setVersion(pkg.version!)
            .setLicense('AGPL-3.0', 'https://github.com/remnawave/panel?tab=AGPL-3.0-1-ov-file')
            .setContact('Remnawave', 'https://remna.st', '')
            .build();
        const documentFactory = () => SwaggerModule.createDocument(app, configSwagger);

        const theme = new SwaggerTheme();
        const options = {
            explorer: false,
            customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
            customSiteTitle: 'Remnawave API Schema',
            swaggerOptions: {
                persistAuthorization: true,
            },
        };

        SwaggerModule.setup(
            config.getOrThrow<string>('SWAGGER_PATH'),
            app,
            documentFactory,
            options,
        );

        app.use(
            config.getOrThrow<string>('SCALAR_PATH'),

            apiReference({
                theme: 'purple',
                hideClientButton: false,
                darkMode: true,
                hiddenClients: [
                    'asynchttp',
                    'nethttp',
                    'okhttp',
                    'unirest',
                    'nsurlsession',
                    'httr',
                    'native',
                    'libcurl',
                    'httpclient',
                    'restsharp',
                    'clj_http',
                    'webrequest',
                    'restmethod',
                    'cohttp',
                ],
                defaultHttpClient: {
                    targetKey: 'js',
                    clientKey: 'axios',
                },

                spec: {
                    content: documentFactory,
                },
            }),
        );
    }
}
