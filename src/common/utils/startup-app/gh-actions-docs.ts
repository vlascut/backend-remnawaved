import { DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { readPackageJSON } from 'pkg-types';
import fs from 'node:fs';

export async function ghActionsDocs(app: INestApplication<unknown>) {
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

    const document = documentFactory();

    fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
}
