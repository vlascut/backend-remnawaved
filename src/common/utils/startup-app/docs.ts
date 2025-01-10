import { apiReference } from '@scalar/nestjs-api-reference';
import { SwaggerThemeNameEnum } from 'swagger-themes';
import { DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SwaggerTheme } from 'swagger-themes';
import { readPackageJSON } from 'pkg-types';

export async function getDocs(app: INestApplication<unknown>, config: ConfigService) {
    const isSwaggerEnabled = config.getOrThrow<string>('IS_DOCS_ENABLED');

    if (isSwaggerEnabled === 'true') {
        const pkg = await readPackageJSON();

        const configSwagger = new DocumentBuilder()
            .setTitle('Remnawave API Schema')
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
            .setDescription(pkg.description!)
            .setVersion(pkg.version!)
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
