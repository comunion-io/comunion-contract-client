import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import {
  createdStartup,
  Startup as StartupContractContext,
} from '../../../types/web3-v1-contracts/Startup';
import startupAbi = require('../../../abis/Startup.json');
import { Web3Service } from '../web3/web3.service';
import { Startup } from './entities/startup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class StartupService {
  constructor(
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
    private readonly configServise: ConfigService,
    private readonly web3Service: Web3Service,
  ) {}

  private startupContract: StartupContractContext;

  async onModuleInit() {
    this.init();

    // 订阅Startup
    this.subscribeStartupContract();
  }

  // 初始化
  private init() {
    const startupContractAddress = this.configServise.get<string>(
      'STARTUP_CONTRACT_ADDRESS',
    );

    this.startupContract = this.web3Service.generateContractClient<StartupContractContext>(
      startupAbi as AbiItem[],
      startupContractAddress,
    );
  }

  private async subscribeStartupContract() {
    this.startupContract.events
      .createdStartup({})
      .on('data', (data) => {
        this.handleStartupCreatedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionStartupCreated] error`);
        console.error(error);
      });
  }

  public async handleStartupCreatedEvent(data: createdStartup) {
    const startup = await this.startupRepository.findOne({
      where: {
        id: data.returnValues.startupId,
        confirmingRevisionId: IsNull(),
      },
    });
    if (startup) {
      startup.confirmingRevisionId = startup.currentRevisionId;
      startup.updatedAt = new Date();
      await this.startupRepository.save(startup);
    }
  }
}
