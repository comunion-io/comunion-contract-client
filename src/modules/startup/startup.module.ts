import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from '../web3/web3.module';
import { Startup } from './entities/startup.entity';
import { StartupSettings } from './entities/startup_settings.entity';
import { StartupService } from './startup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Startup, StartupSettings]), Web3Module],
  providers: [StartupService],
  exports: [StartupService],
})
export class StartupModule {}
