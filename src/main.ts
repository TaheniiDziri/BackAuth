import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

// Charge les variables d'environnement
dotenv.config();

async function bootstrap() {
  // Création de l'application NestJS
  const app = await NestFactory.create(AppModule);
  
  // Ajout des en-têtes COOP et COEP
  app.use((req, res, next) => {
    // Définir les en-têtes pour autoriser la communication entre fenêtres de différentes origines
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); // ou 'unsafe-none' si nécessaire
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
  });

  // ✅ Active le parsing des cookies (important pour l'authentification)
  app.use(cookieParser());

  // ✅ Configuration avancée de CORS pour supporter le frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // L'URL de votre app React
    credentials: true, // Autorise les informations d'identification (cookies, en-têtes d'autorisation)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Récupère le port depuis les variables d'environnement, ou utilise 3000 par défaut
  const port = process.env.PORT || 3000;

  // Lance l'application sur le port spécifié
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
