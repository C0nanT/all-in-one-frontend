import { api } from './client'

export type PayableStatus = 'open' | 'paid'

export interface PayableAccount {
  id: number
  name: string
  payer: string
  period: string
  amount: string
  status: PayableStatus
}

export interface PayableAccountCreatePayload {
  name: string
  amount: string
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
