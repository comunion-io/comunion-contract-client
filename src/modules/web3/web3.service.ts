import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiItem } from 'web3-utils';
import Web3 = require('web3');
import { BaseContract } from '../../../types/web3-v1-contracts/types';

@Injectable()
export class Web3Service {
  constructor(private readonly configServise: ConfigService) {}

  private _client: Web3.default;

  private generateClient() {
    const wsEndPoint = this.configServise.get<string>('INFURA_ENDPOINT_WS');

    const web3 = new (Web3 as any)(
      new (Web3 as any).providers.WebsocketProvider(wsEndPoint, {
        clientConfig: {
          // Useful to keep a connection alive
          keepalive: true,
          keepaliveInterval: 60000, // ms
        },
        // Enable auto reconnection
        reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 5,
          onTimeout: false,
        },
      }),
    ) as Web3.default;

    const account = web3.eth.accounts.privateKeyToAccount(
      this.configServise.get<string>('ACCOUNT_PRIVATE_KEY'),
    );
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    return web3;
  }

  get client() {
    if (!this._client) {
      this._client = this.generateClient();
    }
    return this._client;
  }

  public generateContractClient<T extends BaseContract>(
    abiItems: AbiItem[],
    address: string,
  ): T {
    return (new this.client.eth.Contract(abiItems, address) as any) as T;
  }
}
