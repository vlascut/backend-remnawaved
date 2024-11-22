import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import { initLogs } from './common/utils/startup-app/init-log.util';
import { isDevelopment } from './common/utils/startup-app/is-development';
import { getSwagger } from './common/utils/startup-app/swagger';
import morgan from 'morgan';
import compression from 'compression';

patchNestJsSwagger();

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: initLogs(),
    });

    const config = app.get(ConfigService);

    app.use(helmet());
    app.use(compression());
    app.use(morgan('short'));

    app.setGlobalPrefix(config.getOrThrow<string>('API_PREFIX'));
    app.enableCors({
        origin: isDevelopment() ? '*' : config.getOrThrow<string>('FRONT_END_DOMAIN'),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: false,
    });
    app.useGlobalPipes(new ZodValidationPipe());
    app.enableShutdownHooks();
    getSwagger(app, config);
    await app.listen(Number(config.getOrThrow<string>('APP_PORT')));
}
void bootstrap();
