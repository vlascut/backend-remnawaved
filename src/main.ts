import { isDevelopment } from '@common/utils/startup-app/is-development';
import { getSwagger } from '@common/utils/startup-app/swagger';
import { ROOT } from '@contract/api';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
patchNestJsSwagger();

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger({
            transports: [new winston.transports.Console()],
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike('', {
                    colors: true,
                    prettyPrint: true,
                    processId: true,
                    appName: false,
                }),
            ),
            level: isDevelopment() ? 'debug' : 'info',
        }),
    });

    const config = app.get(ConfigService);

    // app.use(
    //     helmet({
    //         contentSecurityPolicy: {
    //             directives: {
    //                 defaultSrc: ["'self'", 'https://remnawave.github.io'],
    //                 scriptSrc: [
    //                     "'self'",
    //                     'https://cdn.jsdelivr.net',
    //                     'https://remnawave.github.io',
    //                     "'unsafe-eval'",
    //                 ],
    //                 imgSrc: ["'self'", 'https://img.shields.io', 'data:'],
    //                 connectSrc: ["'self'", 'https://remnawave.github.io'],
    //                 workerSrc: ["'self'", 'blob:'],
    //             },
    //         },
    //     }),
    // );

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'", '*'],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
                    imgSrc: ["'self'", 'data:', '*'],
                    connectSrc: ["'self'", '*'],
                    workerSrc: ["'self'", 'blob:', '*'],
                },
            },
        }),
    );

    app.use(compression());

    app.use(morgan('short'));

    app.setGlobalPrefix(ROOT);
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
