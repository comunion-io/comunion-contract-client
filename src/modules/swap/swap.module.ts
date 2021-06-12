import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackendModule } from '../backend/backend.module';
import { Erc20Module } from '../erc20/erc20.module';
import { Web3Module } from '../web3/web3.module';
import { Transaction } from './entities/transaction.entity';
import { SwapService } from './swap.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    Web3Module,
    BackendModule,
    Erc20Module,
  ],
  providers: [SwapService],
})
export class SwapModule {}
