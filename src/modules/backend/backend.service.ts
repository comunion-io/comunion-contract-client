import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IProposal } from './interfaces/proposal.interface';

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

  public async test() {
    console.log(
      await this._request({
        path: '/cores/discos',
        method: 'get',
      }),
    );
  }

  public async createProposal(proposal: IProposal) {
    return await this._request({
      path: '/cores/proposals',
      method: 'post',
      data: proposal,
    });
  }
}
