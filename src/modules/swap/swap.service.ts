import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import {
  PairCreated,
  SwapFactory as SwapFactoryContractContext,
} from '../../../types/web3-v1-contracts/SwapFactory';
import {
  Burn,
  Mint,
  Swap,
  SwapPair as SwapPairContractContext,
  Sync,
} from '../../../types/web3-v1-contracts/SwapPair';
import SwapFactoryAbi = require('../../../abis/SwapFactory.json');
import SwapPairAbi = require('../../../abis/SwapPair.json');
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Web3Service } from '../web3/web3.service';
import { BackendService } from '../backend/backend.service';
import { Erc20Service } from '../erc20/erc20.service';
import dayjs = require('dayjs');

@Injectable()
export class SwapService {
  private WETH: string;

  constructor(
    private readonly configServise: ConfigService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly web3Service: Web3Service,
    private readonly backendService: BackendService,
    private readonly erc20Service: Erc20Service,
  ) {
    this.WETH = this.configServise.get<string>('WETH_ADDRESS').toLowerCase();
  }

  private swapFactoryContract: SwapFactoryContractContext;

  async onModuleInit() {
    this.init();

    // console.log(await this.transactionRepository.find());

    // 订阅Swap工厂
    this.subscribeSwapFactoryContract();

    // 获取所有的交易对合约地址
    const swapPairsAddresses = await this.getAllSwapPairsAddress();

    // console.log(swapPairsAddresses);
    // 订阅所有的交易对合约
    for (const swapPairsAddress of swapPairsAddresses) {
      this.subscribeSwapPairContract(swapPairsAddress);
    }
  }

  // 初始化
  private init() {
    const swapFactoryContractAddress = this.configServise.get<string>(
      'SWAP_FACTORY_CONTRACT_ADDRESS',
    );

    this.swapFactoryContract = this.web3Service.generateContractClient<SwapFactoryContractContext>(
      SwapFactoryAbi as AbiItem[],
      swapFactoryContractAddress,
    );
  }

  private async subscribeSwapFactoryContract() {
    this.swapFactoryContract.events.PairCreated({}).on('data', async (data) => {
      this.handleSwapFactoryPairCreatedEvent(data);
    });
  }

  private async getAllSwapPairsAddress(): Promise<string[]> {
    const allPairLength = Number(
      await this.swapFactoryContract.methods.allPairsLength().call(),
    );
    // 开发用，只取前几个
    // const allPairLength = 1;

    const list: Promise<string>[] = [];
    for (let i = 0; i < allPairLength; i += 1) {
      list.push(this.swapFactoryContract.methods.allPairs(String(i)).call());
    }
    return await Promise.all(list);
  }

  private async subscribeSwapPairContract(address: string): Promise<void> {
    const swapPairContract = this.web3Service.generateContractClient<SwapPairContractContext>(
      SwapPairAbi as AbiItem[],
      // 主网Uniswap合约：0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc
      address,
    );
    const isReverse =
      (await swapPairContract.methods.token0().call()).toLowerCase() ===
      this.WETH;
    swapPairContract.events.Swap({}).on('data', (data) => {
      this.handleSwapPairSwapEvent(data, isReverse);
    });
    swapPairContract.events.Sync({}).on('data', (data) => {
      this.handleSwapPairSyncEvent(data, isReverse);
    });
    swapPairContract.events.Mint({}).on('data', (data) => {
      this.handleSwapPairMintEvent(data, isReverse);
    });
    swapPairContract.events.Burn({}).on('data', (data) => {
      this.handleSwapPairBurnEvent(data, isReverse);
    });
  }

  private async handleSwapFactoryPairCreatedEvent(
    data: PairCreated,
  ): Promise<void> {
    console.log('handleSwapFactoryPairCreatedEvent', data);
    const [token0, token1] = await Promise.all([
      this.erc20Service.getInfo(data.returnValues.token0),
      this.erc20Service.getInfo(data.returnValues.token1),
    ]);
    const isReverse = token0.address.toLowerCase() === this.WETH;
    await this.backendService.createSwapPair(
      data.transactionHash,
      data.returnValues.pair,
      isReverse ? token1 : token0,
      isReverse ? token0 : token1,
    );
  }

  private async handleSwapPairSwapEvent(
    data: Swap,
    isReverse: boolean,
  ): Promise<void> {
    console.log('handleSwapPairSwapEvent', data, isReverse);
    await this.backendService.swapSwapPair(
      data.transactionHash,
      data.address,
      data.returnValues.sender,
      isReverse ? data.returnValues.amount1In : data.returnValues.amount0In,
      isReverse ? data.returnValues.amount0In : data.returnValues.amount1In,
      isReverse ? data.returnValues.amount1Out : data.returnValues.amount0Out,
      isReverse ? data.returnValues.amount0Out : data.returnValues.amount1Out,
      data.returnValues.to,
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
  }

  private async handleSwapPairSyncEvent(
    data: Sync,
    isReverse: boolean,
  ): Promise<void> {
    console.log('handleSwapPairSyncEvent', data, isReverse);
    await this.backendService.syncSwapPair(
      data.address,
      isReverse ? data.returnValues.reserve1 : data.returnValues.reserve0,
      isReverse ? data.returnValues.reserve0 : data.returnValues.reserve1,
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
  }

  private async handleSwapPairMintEvent(
    data: Mint,
    isReverse: boolean,
  ): Promise<void> {
    console.log('handleSwapPairMintEvent', data, isReverse);
    await this.backendService.mintSwapPair(
      data.transactionHash,
      data.address,
      data.returnValues.sender,
      isReverse ? data.returnValues.amount1 : data.returnValues.amount0,
      isReverse ? data.returnValues.amount0 : data.returnValues.amount1,
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
  }

  private async handleSwapPairBurnEvent(
    data: Burn,
    isReverse: boolean,
  ): Promise<void> {
    console.log('handleSwapPairBurnEvent', data, isReverse);
    await this.backendService.burnSwapPair(
      data.transactionHash,
      data.address,
      data.returnValues.sender,
      isReverse ? data.returnValues.amount1 : data.returnValues.amount0,
      isReverse ? data.returnValues.amount0 : data.returnValues.amount1,
      data.returnValues.to,
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
  }
}
