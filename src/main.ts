import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './commons/filters/http-exception.filter';
import { CustomBoostrap } from './config/boostrap.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Client Manager Microservice')
    .setDescription('This is an API documentation for the microservice')
    .setVersion('1.0')
    .build();
  SwaggerModule.createDocument(app, swaggerConfig);

  // Global config
  app.useGlobalFilters(new AllExceptionsFilter());

  // Create Jamal-Partner defaults
  await CustomBoostrap.run();

  // enabling cors
  const whitelistedAddress: string[] = [];
  app.enableCors({
    origin(origin, callback) {
      if (!origin || whitelistedAddress.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: 'content-type, authorization, client-id, client-secret, client-scope, service, ip-address, origin, Accept, Access-Control-Allow-Origin',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS,HEAD',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
