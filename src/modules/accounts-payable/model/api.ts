import { api } from '@/core/api/client'

export type PayableStatus = 'unpaid' | 'paid'

export interface PayableAccount {
  id: number
  name: string
  status: PayableStatus
  payment: {
    id?: number
    payer_id?: number
    payer: string
    amount: number
    period: string
  }
}

export async function fetchPayableAccounts(period: string): Promise<PayableAccount[]> {
  const res = (await api.get('payable-accounts', {
    params: { period: period },
  })) as { data: PayableAccount[] }
  return res.data
}

export async function createPayableAccount(name: string): Promise<PayableAccount> {
  const res = (await api.post('payable-accounts', { name })) as { data: PayableAccount }
  return res.data
}

export async function payPayableAccount(
  id: number,
  amount: number,
  period: string,
  payer_id: number,
): Promise<PayableAccount> {
  const res = (await api.post(`payable-accounts/${id}/payments`, { amount, period, payer_id })) as {
    data: PayableAccount
  }
  return res.data
}

export async function updatePayableAccountPayment(
  accountId: number,
  paymentId: number,
  amount: number,
  period: string,
  payer_id: number,
): Promise<void> {
  await api.put(`payable-accounts/${accountId}/payments/${paymentId}`, {
    amount,
    period,
    payer_id,
  })
}
