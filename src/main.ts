import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { EventEmitter } from 'events'; // ✅ importer EventEmitter

async function bootstrap() {
  //  Augmenter la limite globale
  EventEmitter.defaultMaxListeners = 20; // par exemple, 20 listeners au lieu de 10

  const app = await NestFactory.create(AppModule);

  // Active cookie-parser pour lire les cookies dans les requêtes
  app.use(cookieParser());

  // Important : activer CORS pour que le frontend puisse envoyer les cookies
  app.enableCors({
    origin: '*', //  mets ici l'URL de ton frontend
    credentials: true, //  autorise l’envoi de cookies
  });

  await app.listen(3000); // ou ton port habituel
}
bootstrap();
