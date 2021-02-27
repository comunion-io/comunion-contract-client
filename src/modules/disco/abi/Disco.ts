import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import {
  PromiEvent,
  TransactionReceipt,
  EventResponse,
  EventData,
  Web3ContractContext,
} from 'ethereum-abi-types-generator';

export interface CallOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

export interface SendOptions {
  from: string;
  value?: number | string | BN | BigNumber;
  gasPrice?: string;
  gas?: number;
}

export interface EstimateGasOptions {
  from?: string;
  value?: number | string | BN | BigNumber;
  gas?: number;
}

export interface MethodPayableReturnContext {
  send(options: SendOptions): PromiEvent<TransactionReceipt>;
  send(
    options: SendOptions,
    callback: (error: Error, result: any) => void,
  ): PromiEvent<TransactionReceipt>;
  estimateGas(options: EstimateGasOptions): Promise<number>;
  estimateGas(
    options: EstimateGasOptions,
    callback: (error: Error, result: any) => void,
  ): Promise<number>;
  encodeABI(): string;
}

export interface MethodConstantReturnContext<TCallReturn> {
  call(): Promise<TCallReturn>;
  call(options: CallOptions): Promise<TCallReturn>;
  call(
    options: CallOptions,
    callback: (error: Error, result: TCallReturn) => void,
  ): Promise<TCallReturn>;
  encodeABI(): string;
}

export interface MethodReturnContext extends MethodPayableReturnContext {}

export type ContractContext = Web3ContractContext<
  Disco,
  DiscoMethodNames,
  DiscoEventsContext,
  DiscoEvents
>;
export type DiscoEvents =
  | 'createdDisco'
  | 'enabeldDisco'
  | 'fundraisingFailed'
  | 'fundraisingFinished'
  | 'fundraisingSuccessed'
  | 'investToDisco';
export interface DiscoEventsContext {
  createdDisco(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void,
  ): EventResponse;
  enabeldDisco(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void,
  ): EventResponse;
  fundraisingFailed(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void,
  ): EventResponse;
  fundraisingFinished(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void,
  ): EventResponse;
  fundraisingSuccessed(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void,
  ): EventResponse;
  investToDisco(
    parameters: {
      filter?: {};
      fromBlock?: number;
      toBlock?: 'latest' | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void,
  ): EventResponse;
}
export type DiscoMethodNames =
  | 'new'
  | 'enableDisco'
  | 'finishedDisco'
  | 'investor'
  | 'newDisco'
  | 'setCoinBase'
  | 'discoAddress'
  | 'discos'
  | 'getDate'
  | 'investors'
  | 'status';
export interface DiscosResponse {
  walletAddr: string;
  tokenAddr: string;
  description: string;
  fundRaisingStartedAt: string;
  fundRaisingEndedAt: string;
  investmentReward: string;
  rewardDeclineRate: string;
  shareToken: string;
  minFundRaising: string;
  addLiquidityPool: string;
  totalDepositToken: string;
}
export interface InvestorsResponse {
  investor: string;
  value: string;
  time: string;
}
export interface StatusResponse {
  isFinished: boolean;
  isSuccess: boolean;
  isEnabled: boolean;
}
export interface Disco {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  'new'(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param id Type: string, Indexed: false
   */
  enableDisco(id: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param id Type: string, Indexed: false
   */
  finishedDisco(id: string): MethodReturnContext;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param id Type: string, Indexed: false
   * @param time Type: uint256, Indexed: false
   */
  investor(id: string, time: string): MethodPayableReturnContext;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param id Type: string, Indexed: false
   * @param walletAddr Type: address, Indexed: false
   * @param tokenAddr Type: address, Indexed: false
   * @param description Type: string, Indexed: false
   * @param fundRaisingStartedAt Type: uint256, Indexed: false
   * @param fundRaisingEndedAt Type: uint256, Indexed: false
   * @param investmentReward Type: uint256, Indexed: false
   * @param rewardDeclineRate Type: uint256, Indexed: false
   * @param shareToken Type: uint256, Indexed: false
   * @param minFundRaising Type: uint256, Indexed: false
   * @param addLiquidityPool Type: uint256, Indexed: false
   * @param totalDepositToken Type: uint256, Indexed: false
   */
  newDisco(
    id: string,
    walletAddr: string,
    tokenAddr: string,
    description: string,
    fundRaisingStartedAt: string,
    fundRaisingEndedAt: string,
    investmentReward: string,
    rewardDeclineRate: string,
    shareToken: string,
    minFundRaising: string,
    addLiquidityPool: string,
    totalDepositToken: string,
  ): MethodPayableReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param addr Type: address, Indexed: false
   */
  setCoinBase(addr: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: string, Indexed: false
   */
  discoAddress(parameter0: string): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: string, Indexed: false
   */
  discos(parameter0: string): MethodConstantReturnContext<DiscosResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getDate(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: string, Indexed: false
   */
  investors(parameter0: string): MethodConstantReturnContext<InvestorsResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: string, Indexed: false
   */
  status(parameter0: string): MethodConstantReturnContext<StatusResponse>;
}
