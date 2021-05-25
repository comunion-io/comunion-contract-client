import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import { strict as assert } from 'assert';
import {
  createdDisco,
  Disco as DiscoContractContext,
  enabledDisco,
  fundraisingFailed,
  fundraisingFinished,
  fundraisingSucceed,
  investToDisco,
} from '../../../types/web3-v1-contracts/Disco';
import { InjectRepository } from '@nestjs/typeorm';
import { Disco } from './entities/disco.entity';
import { DiscoInvestor } from './entities/disco_investor.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { DiscoState } from './interfaces/disco_state.interface';
import discoAbi = require('../../../abis/Disco.json');
import { UserService } from '../user/user.service';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class DiscoService {
  constructor(
    private readonly configServise: ConfigService,
    @InjectRepository(Disco)
    private readonly discoRepository: Repository<Disco>,
    @InjectRepository(DiscoInvestor)
    private readonly discoInvestorRepository: Repository<DiscoInvestor>,
    private readonly userService: UserService,
    private readonly web3Service: Web3Service,
  ) {}

  private discoContract: DiscoContractContext;

  private discoContractAddress = this.configServise.get<string>(
    'DISCO_CONTRACT_ADDRESS',
  );

  async onModuleInit() {
    this.init();

    // 订阅Disco
    this.subscribeDiscoContract();
  }

  // 初始化
  private init() {
    this.discoContract = this.web3Service.generateContractClient<DiscoContractContext>(
      discoAbi as AbiItem[],
      this.discoContractAddress,
    );
  }

  // 获取合约历史事件
  private getHistoryEvents(
    eventName?:
      | 'createdDisco'
      | 'enabledDisco'
      | 'fundraisingFinished'
      | 'fundraisingFailed'
      | 'fundraisingSucceed'
      | 'investToDisco',
  ) {
    return this.discoContract.getPastEvents(eventName ?? 'allEvents', {
      fromBlock: 0,
      toBlock: 'latest',
    });
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
      .fundraisingFinished({})
      .on('data', (data) => {
        this.handleFundraisingFinishedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionFundraisingFailed] error`);
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

  // 处理DISCO募资结束事件
  private async handleFundraisingFinishedEvent(
    data: fundraisingFinished,
  ): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    const discoId = data.returnValues.discoIdo;
    const disco = await this.getDiscoById(discoId);

    if (!disco) {
      console.error(`[handleEnabledDiscoEvent] disco not found`);
      return;
    }
    if (disco.state !== DiscoState.ENABLED) {
      console.error(`[handleEnabledDiscoEvent] disco state must be "CREATED"`);
      return;
    }

    disco.state = DiscoState.FUNDRAISING_FINISHED;
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
    if (
      disco.state !== DiscoState.ENABLED &&
      disco.state !== DiscoState.FUNDRAISING_FINISHED
    ) {
      console.error(
        `[handleFundraisingFailedEvent] disco state must be "ENABLED" or "FUNDRAISING_FINISHED"`,
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
    if (
      disco.state !== DiscoState.ENABLED &&
      disco.state !== DiscoState.FUNDRAISING_FINISHED
    ) {
      console.error(
        `[handleFundraisingSuccessedEvent] disco state must be "ENABLED" or "FUNDRAISING_FINISHED"`,
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
    const uid = await this.userService.getUidByWalletAddress(
      data.returnValues.investorAddr.toLowerCase(),
    );
    assert(uid, '[handleInvestToDiscoEvent] wallet address not found');
    await this.discoInvestorRepository.save(
      this.discoInvestorRepository.create({
        uid,
        discoId: data.returnValues.discoId,
        ethCount: Number(data.returnValues.amount),
      }),
    );
  }

  public async getDate(): Promise<string | undefined> {
    return this.discoContract
      ? this.discoContract.methods.getDate().call()
      : undefined;
  }

  private async finishDisco(
    id: string,
    nonceInput?: number,
    gasInput?: number,
  ): Promise<void> {
    let nonce: number;
    let gas: number;
    try {
      const from = this.discoContract.defaultAccount;
      nonce =
        nonceInput ??
        (await this.web3Service.client.eth.getTransactionCount(from));

      gas =
        gasInput ??
        (await this.discoContract.methods.finishedDisco(id).estimateGas());

      await this.discoContract.methods.finishedDisco(id).send({
        from,
        gas,
        nonce,
      });
      console.log(`[FinishDisco] transcation sent, nonce ${nonce}, gas ${gas}`);
    } catch (error) {
      console.error(`[FinishDisco] error ${id}: ${error.message}`);
      if (error.message === 'Returned error: nonce too low') {
        this.finishDisco(id, nonce + 1, gas);
      }
    }
  }

  public async finishDiscos() {
    const finishRequiredDiscos = await this.discoRepository.find({
      select: ['id'],
      where: {
        state: DiscoState.ENABLED,
        fundRaisingEndedAt: LessThanOrEqual(new Date()),
      },
    });
    await Promise.all(
      finishRequiredDiscos.map(({ id }) => this.finishDisco(id)),
    );
  }
}
