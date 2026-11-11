import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SearchModule } from './search.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';



async function bootstrap() {
  process.title='search';

  const logger = new Logger(`searchBootstrap`);

  const rmqUrl = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';

  const queue = process.env.SEARCH_QUEUE ?? 'search_queue';


  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SearchModule,
    {
   transport: Transport.RMQ,
      options : {
        urls: [rmqUrl],
        queue,
        queueOptions : {
          durable: false
        }
      }
    },
  );

  app.enableShutdownHooks();

  await app.listen();

  logger.log(`Search RMQ listening on queue via ${rmqUrl}`);

}
 bootstrap();
