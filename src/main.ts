import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/fillters/http-exception.fillter';
import { ValidationExceptionFilter } from './common/fillters/validation-exception.fillter';

async function bootstrap() {
  let app = null;
  if (String(process.env.HTTPS).toUpperCase() === 'TRUE') {
    const fs = require('fs');
    const keyFile = fs.readFileSync(__dirname + '/../ssls/' + String(process.env.SSL_KEY_FILE));
    const certFile = fs.readFileSync(__dirname + '/../ssls/' + String(process.env.SSL_CRT_FILE));

    app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key: keyFile,
        cert: certFile,
      }
    });
  } else {
    app = await NestFactory.create(AppModule);
  }
  app.setGlobalPrefix('api');
  //Exception-Pipe
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  // cors
  const env = process.env.ENV;
  const isDev = String(env) === 'DEV';
  if (isDev) {
    app.enableCors();
  } else {
    const whitelist = process.env.DOMAIN_ALLOW;
    app.enableCors({
      origin: function (origin: any, callback: any) {
        if (whitelist.indexOf(origin) !== -1) {
          console.log("allowed cors for:", origin);
          callback(null, true);
        } else {
          if (origin)
            console.log("blocked cors for:", origin);
          callback(null, false);
        }
      },
      allowedHeaders: "Authorization, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
      methods: "GET,PUT,POST,DELETE,UPDATE,OPTIONS,HEAD,PATCH",
      credentials: true,
    });
  }

  //Swagger
  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('SERVICE MARKET-PLACE : SERVER NEST JS')
    .setDescription('SERVICE MARKET-PLACE API CRUD')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs-swg-myhufier-by-admin', app, document);

  await app.listen(process.env.PORT);

  console.log(`
  ============================================

  API Server is running on: ${await app.getUrl()}/api-docs-swg-myhufier-by-admin

  ============================================
  `);
}
bootstrap();
