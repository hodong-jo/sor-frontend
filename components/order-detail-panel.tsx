'use client'

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Circle,
  CircleCheck,
  CircleX,
  Clock3,
  FileClock,
  Info,
  X,
} from 'lucide-react'
import type { Order, OrderStatus } from '@/lib/orders'
import { getOrderDetailMetadata, getOrderStatusCode, type ProcessingEvent } from '@/lib/order-history'

const statusStyles: Record<OrderStatus, string> = {
  접수: 'bg-sky-50 text-sky-700 ring-sky-200',
  '검증 완료': 'bg-amber-50 text-amber-700 ring-amber-200',
  '라우팅 완료': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  '처리 완료': 'bg-blue-50 text-blue-700 ring-blue-200',
  거절: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const numberFormat = new Intl.NumberFormat('ko-KR')

function EventMarker({ event }: { event: ProcessingEvent }) {
  if (event.state === 'failed') {
    return <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-4 ring-white"><CircleX size={17} aria-hidden="true" /></span>
  }

  if (event.state === 'completed') {
    return <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-white"><CircleCheck size={17} aria-hidden="true" /></span>
  }

  return <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-4 ring-white"><Circle size={15} aria-hidden="true" /></span>
}

export function OrderDetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const detail = getOrderDetailMetadata(order)

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pt-9">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onClose} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
          <ArrowLeft size={14} aria-hidden="true" /> 주문 목록으로 돌아가기
        </button>
        <button onClick={onClose} aria-label="주문 상세 닫기" className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-400"><span>운영 콘솔</span><span>/</span><span>주문 관리</span><span>/</span><span className="text-slate-600">주문 상세</span></div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] font-bold tracking-[-0.05em] text-slate-900 sm:text-[27px]">주문 상세</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[order.status]}`}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{order.status}</span>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-semibold text-slate-500">{getOrderStatusCode(order.status)}</span>
          </div>
          <p className="mt-2 text-[12px] text-slate-500 sm:text-[13px]">목업 주문 데이터와 처리 단계별 이력을 확인합니다.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800"><FileClock size={13} aria-hidden="true" />목업 데이터 · API 미연결</div>
      </div>

      <section aria-labelledby="order-summary-title" className="mb-5 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${order.side === '매수' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{order.side}</span>
            <div><h2 id="order-summary-title" className="text-[16px] font-bold text-slate-900">{order.name}<span className="ml-2 font-mono text-[12px] font-medium text-slate-400">{order.symbol}</span></h2><p className="mt-1 text-[11px] text-slate-500">{order.side} 주문 · {numberFormat.format(order.quantity)}주 · ₩{numberFormat.format(order.price)}</p></div>
          </div>
          <div className="flex flex-wrap gap-5 sm:gap-8">
            <div><p className="text-[10px] font-medium text-slate-400">주문 수량</p><p className="mt-1 font-mono text-[13px] font-semibold tabular-nums text-slate-800">{numberFormat.format(order.quantity)}주</p></div>
            <div><p className="text-[10px] font-medium text-slate-400">주문 가격</p><p className="mt-1 font-mono text-[13px] font-semibold tabular-nums text-slate-800">₩{numberFormat.format(order.price)}</p></div>
            <div><p className="text-[10px] font-medium text-slate-400">주문 구분</p><p className="mt-1 text-[13px] font-semibold text-slate-800">{order.side}</p></div>
          </div>
        </div>
        <dl className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-5 py-4 sm:px-6"><dt className="text-[10px] font-medium text-slate-400">주문 ID</dt><dd className="mt-1.5 break-all font-mono text-[11px] font-semibold text-slate-700">{order.id}</dd></div>
          <div className="bg-white px-5 py-4 sm:px-6"><dt className="text-[10px] font-medium text-slate-400">주문번호</dt><dd className="mt-1.5 break-all font-mono text-[11px] font-semibold text-slate-700">{detail.orderNumber}</dd></div>
          <div className="bg-white px-5 py-4 sm:px-6"><dt className="text-[10px] font-medium text-slate-400">주문 생성 시간</dt><dd className="mt-1.5 font-mono text-[11px] font-medium tabular-nums text-slate-700">{detail.createdAt}</dd></div>
          <div className="bg-white px-5 py-4 sm:px-6"><dt className="text-[10px] font-medium text-slate-400">최종 수정 시간</dt><dd className="mt-1.5 font-mono text-[11px] font-medium tabular-nums text-slate-700">{detail.updatedAt}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="history-title" className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div><h2 id="history-title" className="text-[14px] font-bold text-slate-900">주문 처리 이력</h2><p className="mt-1 text-[10px] text-slate-400">주문 상태에 따른 단계별 처리 결과</p></div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] font-medium text-slate-500"><Clock3 size={12} aria-hidden="true" />시간순</span>
        </div>
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
          <ol aria-label="주문 처리 단계" className="flex flex-col">
            {detail.events.map((event, index) => (
              <li key={event.code} className="relative flex min-h-[78px] gap-3.5 last:min-h-0">
                {index < detail.events.length - 1 && <span aria-hidden="true" className={`absolute left-[15px] top-8 h-[calc(100%-18px)] w-px ${event.state === 'completed' ? 'bg-emerald-200' : event.state === 'failed' ? 'bg-rose-200' : 'bg-slate-200'}`} />}
                <EventMarker event={event} />
                <div className="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-[12px] font-semibold ${event.state === 'pending' || event.state === 'skipped' ? 'text-slate-400' : 'text-slate-800'}`}>{event.code}<span className="ml-1.5 font-sans font-medium">{event.label}</span></h3>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${event.state === 'completed' ? 'bg-emerald-50 text-emerald-700' : event.state === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>{event.state === 'completed' ? '완료' : event.state === 'failed' ? '실패' : event.state === 'pending' ? '대기' : '미발생'}</span>
                  </div>
                  <p className={`mt-1.5 text-[11px] ${event.state === 'failed' ? 'text-rose-700' : event.state === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>{event.result}</p>
                  {event.time && <time className="mt-1.5 block font-mono text-[10px] tabular-nums text-slate-400" dateTime={`2026-10-18T${event.time}+09:00`}>2026-10-18 {event.time} KST</time>}
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-3">
            {order.status === '거절' && detail.rejectReason && (
              <section aria-labelledby="rejection-reason-title" className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
                <div className="flex items-center gap-2 text-rose-700"><AlertTriangle size={15} aria-hidden="true" /><h3 id="rejection-reason-title" className="text-[11px] font-bold">거절 사유</h3></div>
                <p className="mt-2 text-[11px] leading-relaxed text-rose-800">{detail.rejectReason}</p>
              </section>
            )}
            {detail.routingError && (
              <section aria-labelledby="routing-error-title" className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-amber-800"><AlertTriangle size={15} aria-hidden="true" /><h3 id="routing-error-title" className="text-[11px] font-bold">라우팅 오류 메시지</h3></div>
                <p className="mt-2 break-words font-mono text-[10px] leading-relaxed text-amber-900">{detail.routingError}</p>
              </section>
            )}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-[11px] font-bold text-slate-700">주문 식별 정보</h3>
              <dl className="mt-3 flex flex-col gap-3">
                <div><dt className="text-[10px] text-slate-400">종목</dt><dd className="mt-1 text-[11px] font-semibold text-slate-700">{order.name} <span className="font-mono font-medium text-slate-500">({order.symbol})</span></dd></div>
                <div><dt className="text-[10px] text-slate-400">현재 처리 상태</dt><dd className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">{order.status === '거절' ? <CircleX size={13} className="text-rose-600" /> : order.status === '라우팅 완료' ? <Check size={13} className="text-emerald-600" /> : <Clock3 size={13} className="text-amber-600" />}{getOrderStatusCode(order.status)} · {order.status}</dd></div>
              </dl>
            </div>
            <p className="flex items-start gap-2 rounded-lg bg-blue-50/70 px-3 py-2.5 text-[10px] leading-relaxed text-blue-700"><Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />이 화면의 주문 번호와 처리 시간은 UI 확인용 목업 데이터입니다. 실제 주문 또는 거래소 API 응답이 아닙니다.</p>
          </div>
        </div>
      </section>
      <div className="mt-5 flex justify-end"><button onClick={onClose} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"><ArrowLeft size={14} aria-hidden="true" />목록으로</button></div>
    </div>
  )
}
