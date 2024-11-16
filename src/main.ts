import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

import helmet from 'helmet';

patchNestJsSwagger();

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);
    const nodeEnv = config.getOrThrow<string>('NODE_ENV');

    app.use(helmet());
    app.use;

    app.setGlobalPrefix(config.getOrThrow<string>('API_PREFIX'));
    app.enableCors({
        origin: nodeEnv === 'development' ? '*' : config.getOrThrow<string>('FRONT_END_DOMAIN'),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: false,
    });
    app.useGlobalPipes(new ZodValidationPipe());
    app.enableShutdownHooks();

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
            // .addApiKey({ type: 'apiKey', name: 'Authorization', in: 'header' })
            .setDescription('API for Remnawave')
            .setVersion('0.0.1')
            .build();
        const documentFactory = () => SwaggerModule.createDocument(app, configSwagger);

        const theme = new SwaggerTheme();
        const options = {
            explorer: false,
            customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
            customSiteTitle: 'Remnawave API Schema',
        };

        SwaggerModule.setup(
            config.getOrThrow<string>('SWAGGER_PATH'),
            app,
            documentFactory,
            options,
        );
    }

    await app.listen(Number(config.getOrThrow<string>('APP_PORT')));
}
void bootstrap();
