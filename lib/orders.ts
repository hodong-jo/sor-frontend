export type OrderStatus =
  | '접수'
  | '검증 완료'
  | '라우팅 완료'
  | '처리 완료'
  | '거절'

export type Order = {
  id: string
  symbol: string
  name: string
  side: '매수' | '매도'
  quantity: number
  price: number
  status: OrderStatus
  time: string
}

export type ApiOrder = {
  orderId: string
  symbol: string
  quantity: number
  price: number
  orderTime?: string
  status: 'RECEIVED' | 'VALIDATED' | 'ROUTED' | 'COMPLETED' | 'REJECTED'
}

export function toOrderStatus(status: ApiOrder['status']): OrderStatus {
  switch (status) {
    case 'RECEIVED':
      return '접수'
    case 'VALIDATED':
      return '검증 완료'
    case 'ROUTED':
      return '라우팅 완료'
    case 'COMPLETED':
      return '처리 완료'
    case 'REJECTED':
      return '거절'
  }
}

export const statusFilters = [
  '전체',
  '접수',
  '검증 완료',
  '라우팅 완료',
  '처리 완료',
  '거절',
] as const