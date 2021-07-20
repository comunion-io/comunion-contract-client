import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import {
  createdStartup,
  Startup as StartupContractContext,
} from '../../../types/web3-v1-contracts/Startup';
import {
  sendWhenHasChanges,
  IRO as StartupSettingsContractContext,
} from '../../../types/web3-v1-contracts/IRO';
import startupAbi = require('../../../abis/Startup.json');
import startupSettingsAbi = require('../../../abis/IRO.json');
import { Web3Service } from '../web3/web3.service';
import { Startup } from './entities/startup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { StartupSettings } from './entities/startup_settings.entity';

@Injectable()
export class StartupService {
  constructor(
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
    @InjectRepository(StartupSettings)
    private readonly startupSettingsRepository: Repository<StartupSettings>,
    private readonly configServise: ConfigService,
    private readonly web3Service: Web3Service,
  ) {}

  private startupContract: StartupContractContext;
  private startupSettingsContract: StartupSettingsContractContext;

  async onModuleInit() {
    this.init();

    // 订阅Startup
    this.subscribeStartupContract();
    // 订阅Startup
    this.subscribeStartupSettingsContract();
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

    const startupSettingsContractAddress = this.configServise.get<string>(
      'STARTUP_SETTINGS_CONTRACT_ADDRESS',
    );
    this.startupSettingsContract = this.web3Service.generateContractClient<StartupSettingsContractContext>(
      startupSettingsAbi as AbiItem[],
      startupSettingsContractAddress,
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

  private async subscribeStartupSettingsContract() {
    this.startupSettingsContract.events
      .sendWhenHasChanges({})
      .on('data', (data) => {
        this.handleStartupSettingsChangedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionStartupSettingsChangedEvent] error`);
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

  public async handleStartupSettingsChangedEvent(data: sendWhenHasChanges) {
    const startupSettings = await this.startupSettingsRepository.findOne({
      where: {
        id: data.returnValues.id,
        confirmingRevisionId: IsNull(),
      },
    });
    if (startupSettings) {
      startupSettings.confirmingRevisionId = startupSettings.currentRevisionId;
      startupSettings.updatedAt = new Date();
      await this.startupSettingsRepository.save(startupSettings);
    }
  }
}
