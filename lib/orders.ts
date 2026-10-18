export type OrderStatus = '접수' | '검증 완료' | '라우팅 완료' | '거절'

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

export const orders: Order[] = [
  { id: 'SOR-20261018-0128', symbol: '005930', name: '삼성전자', side: '매수', quantity: 120, price: 72_400, status: '라우팅 완료', time: '14:32:18' },
  { id: 'SOR-20261018-0127', symbol: '000660', name: 'SK하이닉스', side: '매도', quantity: 45, price: 198_500, status: '검증 완료', time: '14:31:52' },
  { id: 'SOR-20261018-0126', symbol: '035420', name: '네이버', side: '매수', quantity: 30, price: 234_000, status: '접수', time: '14:31:09' },
  { id: 'SOR-20261018-0125', symbol: '005380', name: '현대차', side: '매수', quantity: 18, price: 267_000, status: '라우팅 완료', time: '14:29:44' },
  { id: 'SOR-20261018-0124', symbol: '051910', name: 'LG화학', side: '매도', quantity: 12, price: 318_500, status: '거절', time: '14:28:31' },
  { id: 'SOR-20261018-0123', symbol: '006400', name: '삼성SDI', side: '매수', quantity: 25, price: 221_000, status: '라우팅 완료', time: '14:27:16' },
  { id: 'SOR-20261018-0122', symbol: '035720', name: '카카오', side: '매수', quantity: 80, price: 41_250, status: '검증 완료', time: '14:25:58' },
  { id: 'SOR-20261018-0121', symbol: '028260', name: '삼성물산', side: '매도', quantity: 22, price: 162_000, status: '라우팅 완료', time: '14:24:37' },
  { id: 'SOR-20261018-0120', symbol: '003550', name: 'LG', side: '매수', quantity: 40, price: 82_100, status: '접수', time: '14:22:05' },
  { id: 'SOR-20261018-0119', symbol: '105560', name: 'KB금융', side: '매도', quantity: 35, price: 96_800, status: '라우팅 완료', time: '14:20:49' },
  { id: 'SOR-20261018-0118', symbol: '012330', name: '현대모비스', side: '매수', quantity: 14, price: 249_500, status: '거절', time: '14:18:22' },
  { id: 'SOR-20261018-0117', symbol: '066570', name: 'LG전자', side: '매수', quantity: 28, price: 104_000, status: '라우팅 완료', time: '14:16:41' },
]

export const statusFilters = ['전체', '접수', '검증 완료', '라우팅 완료', '거절'] as const
