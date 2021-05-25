import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from '../web3/web3.module';
import { Transaction } from './entities/transaction.entity';
import { SwapService } from './swap.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), Web3Module],
  providers: [SwapService],
})
export class SwapModule {}
