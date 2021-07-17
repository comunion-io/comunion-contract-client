import axios from 'axios';
import * as https from 'https';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IProposal } from './interfaces/proposal.interface';
import { IErc20 } from './interfaces/erc20.interface';

@Injectable()
export class BackendService {
  private __axiosInstance;

  constructor(private readonly configServise: ConfigService) {
    this.__axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  private async _request({
    path,
    method,
    params,
    data,
  }: {
    path: string;
    method: 'post' | 'get' | 'put';
    params?: Record<string, any>;
    data?: Record<string, any>;
  }) {
    const requestParmas = {
      method,
      baseURL: this.configServise.get<string>('BACKEND_HOST'),
      headers: { Host: this.configServise.get<string>('BACKEND_DOMAIN') },
      url: path,
      params,
      data,
    };
    try {
      const res = await this.__axiosInstance(requestParmas);
      if (res.status >= 200 && res.status < 400) {
        console.log(
          `[RequestBackend][INFO] ${JSON.stringify({
            ...requestParmas,
            res: res.data,
          })}`,
        );
        return res.data;
      }
      throw new Error(`Request failed with ${res.status}`);
    } catch (error) {
      console.log(`[RequestBackend][ERROR] ${JSON.stringify(requestParmas)}`);
      console.error(error);
    }
  }

  public async createSwapPair(
    txId: string,
    pairAddress: string,
    token0: IErc20,
    token1: IErc20,
  ) {
    return await this._request({
      path: '/cores/swap/pairs',
      method: 'post',
      data: {
        txId,
        pairAddress,
        token0,
        token1,
      },
    });
  }

  public async mintSwapPair(
    txId: string,
    pairAddress: string,
    sender: string,
    amount0: string,
    amount1: string,
    occuredAt: string,
  ) {
    return await this._request({
      path: '/cores/swap/mints',
      method: 'post',
      data: {
        txId,
        pairAddress,
        sender,
        amount0,
        amount1,
        occuredAt,
      },
    });
  }

  public async burnSwapPair(
    txId: string,
    pairAddress: string,
    sender: string,
    amount0: string,
    amount1: string,
    to: string,
    occuredAt: string,
  ) {
    return await this._request({
      path: '/cores/swap/burns',
      method: 'post',
      data: {
        txId,
        pairAddress,
        sender,
        amount0,
        amount1,
        occuredAt,
      },
    });
  }

  public async swapSwapPair(
    txId: string,
    pairAddress: string,
    sender: string,
    amount0In: string,
    amount1In: string,
    amount0Out: string,
    amount1Out: string,
    to: string,
    occuredAt: string,
  ) {
    return await this._request({
      path: '/cores/swap/swaps',
      method: 'post',
      data: {
        txId,
        pairAddress,
        sender,
        amount0In,
        amount1In,
        amount0Out,
        amount1Out,
        to,
        occuredAt,
      },
    });
  }

  public async syncSwapPair(
    pairAddress: string,
    reserve0: string,
    reserve1: string,
    occuredAt: string,
  ) {
    return await this._request({
      path: '/cores/swap/syncs',
      method: 'post',
      data: {
        pairAddress,
        reserve0,
        reserve1,
        occuredAt,
      },
    });
  }

  public async createProposal(proposal: IProposal) {
    return await this._request({
      path: '/cores/proposals',
      method: 'post',
      data: proposal,
    });
  }

  public async voteProposal(
    proposalId: string,
    vote: {
      txId: string;
      amount: number;
      isApproved: boolean;
      walletAddr: string;
      createdAt: string;
    },
  ) {
    return await this._request({
      path: `/cores/proposal/${proposalId}/vote`,
      method: 'post',
      data: vote,
    });
  }

  public async statusChangeProposal(proposalId: string, status: number) {
    return await this._request({
      path: `/cores/proposal/${proposalId}`,
      method: 'put',
      data: {
        status,
      },
    });
  }
}
