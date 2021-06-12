import { Injectable } from '@nestjs/common';
import { AbiItem } from 'web3-utils';
import { Erc20 as Erc20ContractContext } from '../../../types/web3-v1-contracts/Erc20';
import erc20Abi = require('../../../abis/Erc20.json');
import { Web3Service } from '../web3/web3.service';
import { IErc20 } from '../backend/interfaces/erc20.interface';

@Injectable()
export class Erc20Service {
  constructor(private readonly web3Service: Web3Service) {}

  public async getInfo(address: string): Promise<IErc20> {
    const erc20Contract = this.web3Service.generateContractClient<Erc20ContractContext>(
      erc20Abi as AbiItem[],
      address,
    );

    const [name, symbol, decimals] = await Promise.all([
      erc20Contract.methods.name().call(),
      erc20Contract.methods.symbol().call(),
      erc20Contract.methods.decimals().call(),
    ]);
    return {
      name,
      symbol,
      decimals: Number(decimals),
      address,
    };
  }
}
