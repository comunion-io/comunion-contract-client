import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import {
  accepted,
  Proposal as ProposalContractContext,
} from '../../../types/web3-v1-contracts/Proposal';
import proposalAbi = require('../../../abis/Proposal.json');
import { Web3Service } from '../web3/web3.service';
import { BackendService } from '../backend/backend.service';

@Injectable()
export class ProposalService {
  constructor(
    private readonly configServise: ConfigService,
    private readonly web3Service: Web3Service,
    private readonly backendService: BackendService,
  ) {}

  private proposalContract: ProposalContractContext;

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
  }

  // 处理提案接受事件
  private async handleProposalAcceptedEvent(data: accepted): Promise<void> {
    console.log(`${JSON.stringify(data)}`);
    await this.backendService.createProposal({
      id: data.returnValues.proposal[1],
      txId: data.transactionHash,
      startupId: data.returnValues.proposal[0],
      walletAddr: data.returnValues.proposal[7][0],
      // TODO 目前合约实现每一个 proposal 不是单独合约
      contractAddr: this.configServise.get<string>('PROPOSAL_CONTRACT_ADDRESS'),
      status: parseInt(data.returnValues.proposal[3], 10),
      title: data.returnValues.proposal[2],
      type: parseInt(data.returnValues.proposal[4], 10) + 1,
      // TODO 这个应该是后端去查
      userId: '1',
      contact: data.returnValues.proposal[5],
      description: data.returnValues.proposal[6],
      voterType: Number(data.returnValues.proposal[8][0]),
      supporters: Number(data.returnValues.proposal[9][0]),
      minApprovalPercent: Number(data.returnValues.proposal[9][1]),
      duration: Math.round(Number(data.returnValues.proposal[9][2]) / 24),
      // 总支付金额大于 0 是有支付
      hasPayment: Number(data.returnValues.proposal[7][5]) > 0,
      paymentAddr: data.returnValues.proposal[11],
      paymentType: Number(data.returnValues.proposal[7][1]) === 1 ? 1 : 2,
      paymentMonths: Number(data.returnValues.proposal[7][2]),
      // TODO 格式不确定。。。
      paymentDate: data.returnValues.proposal[7][3],
      paymentAmount: Number(data.returnValues.proposal[7][5]),
      totalPaymentAmount: Number(data.returnValues.proposal[7][6]),
      terms: data.returnValues.paymentDetails.map((term) => ({
        amount: Number(term[1]),
        content: term[2],
      })),
    });
  }
}
