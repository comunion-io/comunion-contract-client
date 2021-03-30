import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUidByWalletAddress(walletAddress: string) {
    const res = await this.userRepository.findOne({
      select: ['id'],
      where: {
        publicKey: walletAddress,
      },
    });
    return res ? res.id : null;
  }
}
