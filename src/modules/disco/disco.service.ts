import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import {
  createdDisco,
  Disco as DiscoContractContext,
  enabledDisco,
  fundraisingFailed,
  fundraisingSucceed,
  investToDisco,
} from '../../../types/web3-v1-contracts/Disco';
import { InjectRepository } from '@nestjs/typeorm';
import { Disco } from './entities/disco.entity';
import { DiscoInvestor } from './entities/disco_investor.entity';
import { Repository } from 'typeorm';
import { DiscoState } from './interfaces/disco_state.interface';
import Web3 = require('web3');
import discoAbi = require('../../../abis/Disco.json');
@Injectable()
export class DiscoService {
  constructor(
    private readonly configServise: ConfigService,
    @InjectRepository(Disco)
    private readonly discoRepository: Repository<Disco>,
    @InjectRepository(DiscoInvestor)
    private readonly discoInvestorRepository: Repository<DiscoInvestor>,
  ) {}

  private discoContract: DiscoContractContext;

  async onModuleInit() {
    this.init();

    // 订阅Disco
    this.subscribeDiscoContract();
  }

  // 初始化
  private init() {
    const wsEndPoint = this.configServise.get<string>('INFURA_ENDPOINT_WS');
    const discoContractAddress = this.configServise.get<string>(
      'DISCO_CONTRACT_ADDRESS',
    );

    const web3 = new (Web3 as any)(
      new (Web3 as any).providers.WebsocketProvider(wsEndPoint, {
        clientConfig: {
          // Useful to keep a connection alive
          keepalive: true,
          keepaliveInterval: 60000, // ms
        },
        // Enable auto reconnection
        reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 5,
          onTimeout: false,
        },
      }),
    ) as Web3.default;

    this.discoContract = (new web3.eth.Contract(
      discoAbi as AbiItem[],
      discoContractAddress,
    ) as any) as DiscoContractContext;
  }

  // 订阅DISCO合约
  private async subscribeDiscoContract() {
    this.discoContract.events
      .createdDisco({})
      .on('data', (data) => {
        this.handleCreatedDiscoEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionCreatedDisco] error`);
        console.error(error);
      });

    this.discoContract.events
      .enabledDisco({})
      .on('data', (data) => {
        this.handleEnabledDiscoEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionEnabledDisco] error`);
        console.error(error);
      });

    this.discoContract.events
      .fundraisingFailed({})
      .on('data', (data) => {
        this.handleFundraisingFailedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionFundraisingFailed] error`);
        console.error(error);
      });

    this.discoContract.events
      .fundraisingSucceed({})
      .on('data', (data) => {
        this.handleFundraisingSucceedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionFundraisingSuccessed] error`);
        console.error(error);
      });

    this.discoContract.events
      .investToDisco({})
      .on('data', (data) => {
        this.handleInvestToDiscoEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionInvestToDisco] error`);
        console.error(error);
      });
  }

  private async getDiscoById(id: string): Promise<Disco> {
    return await this.discoRepository.findOne({
      where: {
        id,
      },
    });
  }

  // 处理创建DISCO事件
  private async handleCreatedDiscoEvent(data: createdDisco): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    const discoId = data.returnValues.discoId;
    const disco = await this.getDiscoById(discoId);

    if (!disco) {
      console.error(`[handleCreatedDiscoEvent] disco not found`);
      return;
    }
    if (disco.state !== DiscoState.CREATING) {
      console.error(`[handleCreatedDiscoEvent] disco state must be "CREATING"`);
      return;
    }

    disco.state = DiscoState.CREATED;
    disco.fundRaisingAddr = data.returnValues.addr;
    disco.updatedAt = new Date();
    await this.discoRepository.save(disco);
  }

  // 处理打开DISCO事件
  private async handleEnabledDiscoEvent(data: enabledDisco): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    const discoId = data.returnValues.discoId;
    const disco = await this.getDiscoById(discoId);

    if (!disco) {
      console.error(`[handleEnabledDiscoEvent] disco not found`);
      return;
    }
    if (disco.state !== DiscoState.CREATED) {
      console.error(`[handleEnabledDiscoEvent] disco state must be "CREATED"`);
      return;
    }

    disco.state = DiscoState.ENABLED;
    disco.updatedAt = new Date();
    await this.discoRepository.save(disco);
  }

  // 处理DISCO募资失败事件
  private async handleFundraisingFailedEvent(
    data: fundraisingFailed,
  ): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    const discoId = data.returnValues.discoId;
    const disco = await this.getDiscoById(discoId);

    if (!disco) {
      console.error(`[handleFundraisingFailedEvent] disco not found`);
      return;
    }
    if (disco.state !== DiscoState.ENABLED) {
      console.error(
        `[handleFundraisingFailedEvent] disco state must be "ENABLED"`,
      );
      return;
    }

    disco.state = DiscoState.FUNDRAISING_FAIED;
    disco.updatedAt = new Date();
    await this.discoRepository.save(disco);
  }

  // 处理DISCO募资成功事件
  private async handleFundraisingSucceedEvent(
    data: fundraisingSucceed,
  ): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    const discoId = data.returnValues.discoId;
    const disco = await this.getDiscoById(discoId);

    if (!disco) {
      console.error(`[handleFundraisingSuccessedEvent] disco not found`);
      return;
    }
    if (disco.state !== DiscoState.ENABLED) {
      console.error(
        `[handleFundraisingSuccessedEvent] disco state must be "ENABLED"`,
      );
      return;
    }

    disco.state = DiscoState.FUNDRAISING_SUCCESS;
    disco.updatedAt = new Date();
    await this.discoRepository.save(disco);
  }

  // 处理投资事件
  private async handleInvestToDiscoEvent(data: investToDisco): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
  }
}
