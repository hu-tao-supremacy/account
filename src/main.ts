import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { protobufPackage } from './apis/hts/account/service';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.GRPC,
  //     options: {
  //       url: `0.0.0.0:${process.env.GRPC_PORT}`,
  //       package: protobufPackage,
  //       protoPath: join(
  //         __dirname,
  //         '../../apis/proto/hts/account/service.proto',
  //       ),
  //       loader: {
  //         includeDirs: [join(__dirname, '../../apis/proto')],
  //       },
  //     },
  //   },
  // );
  // app.listen(() => console.log('Microservice is listening'));

  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${process.env.GRPC_PORT}`,
      package: protobufPackage,
      protoPath: join(__dirname, '../../apis/proto/hts/account/service.proto'),
      loader: {
        includeDirs: [join(__dirname, '../../apis/proto')],
      },
    },
  });

  await app.startAllMicroservicesAsync();
  await app.listen(5001);
}
bootstrap();
