import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (allowing all origins for deployment)
  app.enableCors({
    origin: true, // Allow all origins (can be restricted to specific domain later)
    credentials: true,
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Use PORT from environment variable (required for deployment platforms)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}

bootstrap();
