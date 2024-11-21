import { SwaggerThemeNameEnum } from 'swagger-themes';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme } from 'swagger-themes';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import path from 'path';
// import fs from 'fs';

export function getSwagger(app: INestApplication<unknown>, config: ConfigService): void {
    const isSwaggerEnabled = config.getOrThrow<string>('IS_SWAGGER_ENABLED');

    if (isSwaggerEnabled === 'true') {
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
            .setDescription('API for Remnawave')
            .setVersion('0.0.1')
            .build();
        const documentFactory = () => SwaggerModule.createDocument(app, configSwagger);

        // const outputPath = path.resolve(process.cwd(), 'openapi.json');
        // fs.writeFileSync(outputPath, JSON.stringify(documentFactory(), null, 2), {
        //     encoding: 'utf8',
        // });

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
    }
}
