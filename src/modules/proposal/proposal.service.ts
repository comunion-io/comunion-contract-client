import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import {
  accepted,
  Proposal as ProposalContractContext,
  statusChanged,
  voted,
} from '../../../types/web3-v1-contracts/Proposal';
import proposalAbi = require('../../../abis/Proposal.json');
import { Web3Service } from '../web3/web3.service';
import { BackendService } from '../backend/backend.service';
import dayjs = require('dayjs');
import { Proposal } from './entities/proposal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    private readonly configServise: ConfigService,
    private readonly web3Service: Web3Service,
    private readonly backendService: BackendService,
  ) {}

  private proposalContract: ProposalContractContext;
  private readonly contractStatusMap = {
    // Voting
    0: 2,
    // Pass
    1: 6,
    // Defeated
    2: 5,
    // Invalid
    3: 4,
  };

  async onModuleInit() {
    this.init();

    // 订阅Proposal
    this.subscribeProposalContract();
  }

  // 初始化
  private init() {
    const proposalContractAddress = this.configServise.get<string>(
      'PROPOSAL_CONTRACT_ADDRESS',
    );

    this.proposalContract = this.web3Service.generateContractClient<ProposalContractContext>(
      proposalAbi as AbiItem[],
      proposalContractAddress,
    );
  }

  private async subscribeProposalContract() {
    this.proposalContract.events
      .accepted({})
      .on('data', (data) => {
        this.handleProposalAcceptedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionProposalAccepted] error`);
        console.error(error);
      });

    this.proposalContract.events
      .voted({})
      .on('data', (data) => {
        this.handleProposalVotedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionProposalVoted] error`);
        console.error(error);
      });

    this.proposalContract.events
      .statusChanged({})
      .on('data', (data) => {
        this.handleProposalStatusChangedEvent(data);
      })
      .on('error', (error) => {
        console.log(`[SubscribtionProposalStatusChanged] error`);
        console.error(error);
      });
  }

  // 处理投票事件
  private async handleProposalVotedEvent(data: voted): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    this.backendService.voteProposal(data.returnValues.v[0], {
      txId: data.transactionHash,
      amount: Number(data.returnValues.v[3]) || Number(data.returnValues.v[4]),
      isApproved: Number(data.returnValues.v[3]) > 0,
      walletAddr: data.returnValues.v[2],
      createdAt: dayjs(Number(data.returnValues.v[5])).toString(),
    });
  }

  // 处理状态变化事件
  private async handleProposalStatusChangedEvent(
    data: statusChanged,
  ): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    this.backendService.statusChangeProposal(
      data.returnValues.id,
      this.contractStatusMap[data.returnValues.target],
    );
  }

  // 处理提案接受事件
  private async handleProposalAcceptedEvent(data: accepted): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    // 总支付金额大于 0 是有支付
    const hasPayment = Number(data.returnValues.proposal[7][5]) > 0;
    await this.backendService.createProposal({
      id: data.returnValues.proposal[1],
      txId: data.transactionHash,
      startupId: data.returnValues.proposal[0],
      walletAddr: data.returnValues.proposal[11].toLowerCase(),
      // TODO 目前合约实现每一个 proposal 不是单独合约
      contractAddr: this.configServise
        .get<string>('PROPOSAL_CONTRACT_ADDRESS')
        .toLowerCase(),
      status: this.contractStatusMap[data.returnValues.proposal[3]],
      title: data.returnValues.proposal[2],
      type: Number(data.returnValues.proposal[4]) + 1,
      contact: data.returnValues.proposal[5],
      description: data.returnValues.proposal[6],
      voterType: Number(data.returnValues.proposal[8][0]),
      supporters: Number(data.returnValues.proposal[9][0]),
      minApprovalPercent: Math.round(
        Number(data.returnValues.proposal[9][1]) * 100,
      ),
      duration: Math.round(Number(data.returnValues.proposal[9][2]) / 24),
      hasPayment,
      paymentAddr: hasPayment
        ? data.returnValues.proposal[7][0].toLowerCase()
        : undefined,
      paymentType: hasPayment
        ? Number(data.returnValues.proposal[7][1]) === 1
          ? 1
          : 2
        : undefined,
      paymentMonths: hasPayment
        ? Number(data.returnValues.proposal[7][2])
        : undefined,
      // TODO 格式不确定。。。
      paymentDate: hasPayment ? data.returnValues.proposal[7][3] : undefined,
      paymentAmount: hasPayment
        ? Number(data.returnValues.proposal[7][4])
        : undefined,
      totalPaymentAmount: hasPayment
        ? Number(data.returnValues.proposal[7][5])
        : undefined,
      terms: data.returnValues.paymentDetails.map((term) => ({
        amount: Number(term[1]),
        content: term[2],
      })),
    });
  }

  private async finishProposal(
    id: string,
    startId: string,
    nonceInput?: number,
    gasInput?: number,
  ): Promise<void> {
    let nonce: number;
    let gas: number;
    try {
      const from = this.proposalContract.defaultAccount;
      nonce =
        nonceInput ??
        (await this.web3Service.client.eth.getTransactionCount(from));

      gas =
        gasInput ??
        (await this.proposalContract.methods
          .releaseProposal(startId, id)
          .estimateGas());

      await this.proposalContract.methods.releaseProposal(startId, id).send({
        from,
        gas,
        nonce,
      });
      console.log(`[FinishDisco] transcation sent, nonce ${nonce}, gas ${gas}`);
    } catch (error) {
      console.error(`[FinishDisco] error ${id}: ${error.message}`);
      if (error.message === 'Returned error: nonce too low') {
        this.finishProposal(id, startId, nonce + 1, gas);
      }
    }
  }

  public async finishProposals() {
    const proposals = await this.proposalRepository.find({
      select: ['id', 'startupId', 'duration', 'createdAt'],
      where: {
        // processing
        status: 2,
        createdAt: LessThanOrEqual(new Date()),
      },
    });
    await Promise.all(
      proposals
        .filter(({ duration, createdAt }) =>
          dayjs(createdAt).add(duration, 'day').isBefore(dayjs()),
        )
        .map(({ id, startupId }) => this.finishProposal(id, startupId)),
    );
  }
}
