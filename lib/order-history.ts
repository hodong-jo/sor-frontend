import type { Order, OrderStatus } from '@/lib/orders'

export type ProcessingState = 'completed' | 'failed' | 'pending' | 'skipped'

export type ProcessingEvent = {
  code: 'RECEIVED' | 'VALIDATED' | 'ROUTED' | 'COMPLETED' | 'REJECTED'
  label: string
  state: ProcessingState
  time?: string
  result: string
}

export type OrderDetailMetadata = {
  orderNumber: string
  createdAt: string
  updatedAt: string
  rejectReason?: string
  routingError?: string
  events: ProcessingEvent[]
}

const orderStatusCode: Record<OrderStatus, string> = {
  접수: 'RECEIVED',
  '검증 완료': 'VALIDATED',
  '라우팅 완료': 'ROUTED',
  거절: 'REJECTED',
}

function addSeconds(time: string, seconds: number) {
  const [hours, minutes, baseSeconds] = time.split(':').map(Number)
  const date = new Date(Date.UTC(2026, 9, 18, hours, minutes, baseSeconds + seconds))
  return date.toISOString().slice(11, 19)
}

export function getOrderDetailMetadata(order: Order): OrderDetailMetadata {
  const isRejected = order.status === '거절'
  const isRouteFailure = order.id === 'SOR-20261018-0118'
  const isValidationFailure = isRejected && !isRouteFailure
  const hasValidated = order.status !== '접수'
  const hasRouted = order.status === '라우팅 완료' || isRouteFailure
  const receivedTime = order.time
  const validatedTime = addSeconds(receivedTime, 12)
  const routedTime = addSeconds(receivedTime, 31)
  const rejectedTime = addSeconds(receivedTime, isRouteFailure ? 48 : 15)

  const events: ProcessingEvent[] = [
    {
      code: 'RECEIVED',
      label: '주문 접수',
      state: 'completed',
      time: receivedTime,
      result: '목업 주문이 접수되었습니다.',
    },
    {
      code: 'VALIDATED',
      label: '주문 검증',
      state: isValidationFailure ? 'failed' : hasValidated ? 'completed' : 'pending',
      time: hasValidated ? validatedTime : undefined,
      result: isValidationFailure
        ? '주문 가능 수량 검증에 실패했습니다.'
        : hasValidated
          ? '필수 항목 및 주문 조건을 확인했습니다.'
          : '검증 대기 중',
    },
    {
      code: 'ROUTED',
      label: '거래소 라우팅',
      state: isRouteFailure ? 'failed' : hasRouted ? 'completed' : 'pending',
      time: hasRouted ? routedTime : undefined,
      result: isRouteFailure
        ? '라우팅에 실패했습니다.'
        : hasRouted
          ? '목업 거래소 경로 배정이 완료되었습니다.'
          : '라우팅 대기 중',
    },
    {
      code: 'COMPLETED',
      label: '체결 완료',
      state: 'pending',
      result: '체결 완료 전입니다.',
    },
    {
      code: 'REJECTED',
      label: '주문 거절',
      state: isRejected ? 'completed' : 'skipped',
      time: isRejected ? rejectedTime : undefined,
      result: isValidationFailure
        ? '주문 검증 단계에서 거절되었습니다.'
        : isRouteFailure
          ? '라우팅 오류로 주문이 거절되었습니다.'
          : '거절 없이 현재 처리 경로가 진행 중입니다.'
    },
  ]

  const completedTimes = events.flatMap((event) => event.time ? [event.time] : [])
  const updatedTime = completedTimes[completedTimes.length - 1] ?? receivedTime
  const suffix = order.id.slice('SOR-'.length)

  return {
    orderNumber: `ORD-${suffix}`,
    createdAt: `2026-10-18 ${receivedTime}`,
    updatedAt: `2026-10-18 ${updatedTime}`,
    rejectReason: isValidationFailure
      ? '주문 수량이 목업 계좌의 주문 가능 수량을 초과했습니다.'
      : isRouteFailure
        ? '사용 가능한 거래소 경로를 확보하지 못했습니다.'
        : undefined,
    routingError: isRouteFailure
      ? 'ROUTE_UNAVAILABLE: 목업 거래소 연결에서 사용 가능한 라우팅 경로를 찾지 못했습니다.'
      : undefined,
    events,
  }
}

export function getOrderStatusCode(status: OrderStatus) {
  return orderStatusCode[status]
}
