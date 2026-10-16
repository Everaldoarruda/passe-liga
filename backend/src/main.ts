import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { setupApiDocs } from './common/api-docs';
import { logRequests } from './common/request-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(logRequests);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  setupApiDocs(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
