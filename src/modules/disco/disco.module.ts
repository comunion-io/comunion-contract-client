import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Web3Module } from '../web3/web3.module';
import { DiscoService } from './disco.service';
import { Disco } from './entities/disco.entity';
import { DiscoInvestor } from './entities/disco_investor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disco, DiscoInvestor]),
    UserModule,
    Web3Module,
  ],
  providers: [DiscoService],
  exports: [DiscoService],
})
export class DiscoModule {}
