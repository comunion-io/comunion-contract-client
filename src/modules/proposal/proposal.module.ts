import { Module } from '@nestjs/common';
import { BackendModule } from '../backend/backend.module';
import { Web3Module } from '../web3/web3.module';
import { ProposalService } from './proposal.service';

@Module({
  imports: [Web3Module, BackendModule],
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ProposalModule {}
