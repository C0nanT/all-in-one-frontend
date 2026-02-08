import { api } from './client'

export type PayableStatus = 'unpaid' | 'paid'

export interface PayableAccount {
  id: number
  name: string
  status: PayableStatus
  payment: {
    payer: string
    amount: number
    period: string
  }
}

export interface PayableAccountCreatePayload {
  name: string
  amount: number
  status: PayableStatus
}

export async function fetchPayableAccounts(period: string): Promise<PayableAccount[]> {
  const res = (await api.get('payable-accounts', {
    params: { 'period': period },
  })) as { data: PayableAccount[] }
  return res.data
}

export async function createPayableAccount(
  payload: PayableAccountCreatePayload
): Promise<PayableAccount> {
  const res = (await api.post('payable-accounts', payload)) as { data: PayableAccount }
  return res.data
}
