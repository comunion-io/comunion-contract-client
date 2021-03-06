/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type createdDisco = ContractEventLog<{
  discoId: string;
  addr: string;
  0: string;
  1: string;
}>;
export type enabledDisco = ContractEventLog<{
  discoId: string;
  0: string;
}>;
export type fundraisingFailed = ContractEventLog<{
  discoId: string;
  0: string;
}>;
export type fundraisingFinished = ContractEventLog<{
  discoIdo: string;
  success: boolean;
  0: string;
  1: boolean;
}>;
export type fundraisingSucceed = ContractEventLog<{
  discoId: string;
  0: string;
}>;
export type investToDisco = ContractEventLog<{
  discoId: string;
  investorAddr: string;
  amount: string;
  0: string;
  1: string;
  2: string;
}>;

export interface Disco extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): Disco;
  clone(): Disco;
  methods: {
    discoAddress(
      arg0: string
    ): NonPayableTransactionObject<{
      discoAddr: string;
      token: string;
      depositAccount: string;
      initLiquidity: string;
      swapEth: string;
      swapToken: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
    }>;

    discos(
      arg0: string
    ): NonPayableTransactionObject<{
      id: string;
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
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
      9: string;
      10: string;
      11: string;
    }>;

    investors(
      arg0: string,
      arg1: number | string | BN
    ): NonPayableTransactionObject<{
      investor: string;
      value: string;
      time: string;
      isDead: boolean;
      0: string;
      1: string;
      2: string;
      3: boolean;
    }>;

    status(
      arg0: string
    ): NonPayableTransactionObject<{
      isFinished: boolean;
      isSuccess: boolean;
      isEnabled: boolean;
      0: boolean;
      1: boolean;
      2: boolean;
    }>;

    setSwap(swapAddr: string): NonPayableTransactionObject<void>;

    setPreFee(pf: number | string | BN): NonPayableTransactionObject<void>;

    getDate(): NonPayableTransactionObject<string>;

    newDisco(
      d: [
        string,
        string,
        string,
        string,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        number | string | BN
      ]
    ): PayableTransactionObject<void>;

    enableDisco(id: string): PayableTransactionObject<void>;

    discoToken(id: string): NonPayableTransactionObject<string>;

    poolEthBalance(id: string): NonPayableTransactionObject<string>;

    poolTokenBalance(id: string): NonPayableTransactionObject<string>;

    finishedDisco(id: string): NonPayableTransactionObject<void>;

    getInvestAmt(
      id: string
    ): NonPayableTransactionObject<{
      0: string;
      1: string;
    }>;

    assign(
      id: string,
      investAmt: number | string | BN
    ): PayableTransactionObject<{
      0: string;
      1: string;
    }>;

    assignEth(
      id: string,
      investAmt: number | string | BN
    ): PayableTransactionObject<string>;

    assignToken(id: string): PayableTransactionObject<string>;

    assignLiquidity(id: string): PayableTransactionObject<void>;

    refund(id: string): PayableTransactionObject<void>;

    investor(
      id: string,
      time: number | string | BN
    ): PayableTransactionObject<void>;
  };
  events: {
    createdDisco(cb?: Callback<createdDisco>): EventEmitter;
    createdDisco(
      options?: EventOptions,
      cb?: Callback<createdDisco>
    ): EventEmitter;

    enabledDisco(cb?: Callback<enabledDisco>): EventEmitter;
    enabledDisco(
      options?: EventOptions,
      cb?: Callback<enabledDisco>
    ): EventEmitter;

    fundraisingFailed(cb?: Callback<fundraisingFailed>): EventEmitter;
    fundraisingFailed(
      options?: EventOptions,
      cb?: Callback<fundraisingFailed>
    ): EventEmitter;

    fundraisingFinished(cb?: Callback<fundraisingFinished>): EventEmitter;
    fundraisingFinished(
      options?: EventOptions,
      cb?: Callback<fundraisingFinished>
    ): EventEmitter;

    fundraisingSucceed(cb?: Callback<fundraisingSucceed>): EventEmitter;
    fundraisingSucceed(
      options?: EventOptions,
      cb?: Callback<fundraisingSucceed>
    ): EventEmitter;

    investToDisco(cb?: Callback<investToDisco>): EventEmitter;
    investToDisco(
      options?: EventOptions,
      cb?: Callback<investToDisco>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "createdDisco", cb: Callback<createdDisco>): void;
  once(
    event: "createdDisco",
    options: EventOptions,
    cb: Callback<createdDisco>
  ): void;

  once(event: "enabledDisco", cb: Callback<enabledDisco>): void;
  once(
    event: "enabledDisco",
    options: EventOptions,
    cb: Callback<enabledDisco>
  ): void;

  once(event: "fundraisingFailed", cb: Callback<fundraisingFailed>): void;
  once(
    event: "fundraisingFailed",
    options: EventOptions,
    cb: Callback<fundraisingFailed>
  ): void;

  once(event: "fundraisingFinished", cb: Callback<fundraisingFinished>): void;
  once(
    event: "fundraisingFinished",
    options: EventOptions,
    cb: Callback<fundraisingFinished>
  ): void;

  once(event: "fundraisingSucceed", cb: Callback<fundraisingSucceed>): void;
  once(
    event: "fundraisingSucceed",
    options: EventOptions,
    cb: Callback<fundraisingSucceed>
  ): void;

  once(event: "investToDisco", cb: Callback<investToDisco>): void;
  once(
    event: "investToDisco",
    options: EventOptions,
    cb: Callback<investToDisco>
  ): void;
}
