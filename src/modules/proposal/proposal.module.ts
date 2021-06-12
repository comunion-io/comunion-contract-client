import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackendModule } from '../backend/backend.module';
import { Web3Module } from '../web3/web3.module';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal]), Web3Module, BackendModule],
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ProposalModule {}
