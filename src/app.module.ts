import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from 'nest-schedule';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DiscoModule } from './modules/disco/disco.module';
import { SwapModule } from './modules/swap/swap.module';
import { ScheduleService } from './schedule.service';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    ScheduleModule.register(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: Number(configService.get('POSTGRES_PORT')),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        schema: configService.get('POSTGRES_SCHEMA'),
        logging: configService.get('POSTGRES_LOGGIN') === 'true',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    DiscoModule,
    SwapModule,
  ],
  providers: [ScheduleService],
})
export class AppModule {
  constructor(private readonly scheduleService: ScheduleService) {}

  async onApplicationBootstrap() {
    if (['production', 'test', undefined].includes(process.env.NODE_ENV)) {
      this.scheduleService.startEthCronJob();
    }
  }
}
