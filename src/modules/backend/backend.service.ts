import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IProposal } from './interfaces/proposal.interface';
import { IErc20 } from './interfaces/erc20.interface';

@Injectable()
export class BackendService {
  constructor(private readonly configServise: ConfigService) {}

  private async _request({
    path,
    method,
    params,
    data,
  }: {
    path: string;
    method: 'post' | 'get';
    params?: Record<string, any>;
    data?: Record<string, any>;
  }) {
    try {
      const res = await axios({
        method,
        baseURL: this.configServise.get<string>('BACKEND_HOST'),
        headers: { Host: this.configServise.get<string>('BACKEND_DOMAIN') },
        url: path,
        params,
        data,
      });
      if (res.status >= 200 && res.status < 400) {
        return res.data;
      }
      throw new Error(`Rquest failed with ${res.status}`);
    } catch (error) {
      console.log(`[RequestBackend] error ${path}`);
      console.error(error);
    }
  }

  // public async test() {
  //   console.log(
  //     await this._request({
  //       path: '/cores/discos',
  //       method: 'get',
  //     }),
  //   );
  // }

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
      path: `/cores/proposal/${proposalId}vote`,
      method: 'post',
      data: vote,
    });
  }
}
