export interface IProposal {
  id: string;
  txId: string;
  startupId: string;
  walletAddr: string;
  contractAddr: string;
  status: number;
  title: string;
  type: number;
  userId: string;
  contact: string;
  description: string;
  voterType: number;
  supporters: number;
  minApprovalPercent: number;
  duration: number;
  hasPayment: boolean;
  paymentAddr?: string;
  paymentType?: number;
  paymentMonths?: number;
  paymentDate?: string;
  paymentAmount?: number;
  totalPaymentAmount?: number;
  terms: Array<{
    amount: number;
    content: string;
  }>;
}
