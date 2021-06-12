import { Module } from '@nestjs/common';
import { Web3Module } from '../web3/web3.module';
import { Erc20Service } from './erc20.service';

@Module({
  imports: [Web3Module],
  providers: [Erc20Service],
  exports: [Erc20Service],
})
export class Erc20Module {}
