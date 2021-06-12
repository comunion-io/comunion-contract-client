import { Injectable } from '@nestjs/common';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { DiscoService } from './modules/disco/disco.service';
import { ProposalService } from './modules/proposal/proposal.service';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectSchedule()
    private readonly schedule: Schedule,
    private readonly discoService: DiscoService,
    private readonly proposalService: ProposalService,
  ) {}

  startEthCronJob() {
    this.schedule.scheduleCronJob('eth-cron-job', '*/10 * * * *', async () => {
      try {
        // keep web3 websocket connection
        await this.discoService.getDate();
        console.log('[EthCronJob] Ping Contract');
      } catch (error) {
        console.error('[EthCronJob] Keep WS connection failed');
      }

      try {
        // finish timesup discos
        await this.discoService.finishDiscos();
      } catch (error) {
        console.error('[EthCronJob] Finish Discos failed');
      }

      try {
        // finish timesup proposals
        await this.proposalService.finishProposals();
      } catch (error) {
        console.error('[EthCronJob] Finish Proposals failed');
      }

      return false;
    });
  }
}
