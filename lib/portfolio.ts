import type { Order } from '@/lib/orders'

export type PortfolioPosition = {
  symbol: string
  name: string
  quantity: number
  averagePrice: number
}

type PositionAccumulator = {
  symbol: string
  name: string
  quantity: number
  totalCost: number
}

export function calculatePortfolioPositions(orders: Order[]): PortfolioPosition[] {
  const positions = new Map<string, PositionAccumulator>()

  for (const order of orders) {
    if (order.status !== '처리 완료' || order.side !== '매수') continue
    if (!Number.isFinite(order.quantity) || order.quantity <= 0 || !Number.isFinite(order.price) || order.price <= 0) continue

    const current = positions.get(order.symbol) ?? {
      symbol: order.symbol,
      name: order.name,
      quantity: 0,
      totalCost: 0,
    }

    current.quantity += order.quantity
    current.totalCost += order.quantity * order.price
    positions.set(order.symbol, current)
  }

  return Array.from(positions.values())
    .map(({ symbol, name, quantity, totalCost }) => ({
      symbol,
      name,
      quantity,
      averagePrice: totalCost / quantity,
    }))
    .sort((left, right) => right.quantity * right.averagePrice - left.quantity * left.averagePrice)
}
