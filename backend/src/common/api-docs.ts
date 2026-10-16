import { applyDecorators, INestApplication } from '@nestjs/common';
import { ApiQuery, ApiQueryOptions, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const DOCS_PATH = 'api/docs';

export const ApiQueries = (...queries: ApiQueryOptions[]) =>
  applyDecorators(...queries.map((query) => ApiQuery({ required: false, ...query })));

export function setupApiDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Passe Liga API')
    .setDescription('Mercado de jogadores, clubes, escalações e partidas da liga.')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(DOCS_PATH, app, () => SwaggerModule.createDocument(app, config));
}
