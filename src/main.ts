import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("bootstrap")

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      //forbidNonWhitelisted: true, para poder aceptar multiples args en el findAll, esta validacion la hace graphql
    })
  );

  await app.listen(3000);
  logger.log(`App corriento en el puerto ${process.env.PORT}`)
}
bootstrap();
