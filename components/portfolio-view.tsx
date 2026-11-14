'use client'

import useSWR from 'swr'
import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, RefreshCw } from 'lucide-react'
import { fetchStockQuote, type StockQuote } from '@/lib/market-stocks'
import type { PortfolioPosition } from '@/lib/portfolio'

const numberFormat = new Intl.NumberFormat('ko-KR')
type QuoteMap = Record<string, StockQuote | null>

function parseQuoteNumber(value?: string | number) {
  if (value === undefined) return Number.NaN
  const parsed = Number(String(value).replaceAll(',', '').replace(/^\+/, '').trim())
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatWon(value: number) {
  return Number.isFinite(value) ? `₩${numberFormat.format(Math.round(value))}` : '—'
}

function SummaryCard({ label, value, detail, tone = 'neutral' }: {
  label: string
  value: string
  detail?: string
  tone?: 'neutral' | 'up' | 'down'
}) {
  const toneClass = tone === 'up' ? 'text-rose-600' : tone === 'down' ? 'text-blue-600' : 'text-slate-900'
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.025)]">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className={`mt-3 truncate font-mono text-[21px] font-bold leading-none tracking-[-0.04em] tabular-nums ${toneClass}`}>{value}</p>
      {detail && <p className="mt-2 text-[10px] text-slate-400">{detail}</p>}
    </article>
  )
}

export function PortfolioView({ positions, onNewOrder, ordersLoading, ordersError, onRefreshOrders }: {
  positions: PortfolioPosition[]
  onNewOrder: () => void
  ordersLoading: boolean
  ordersError: string
  onRefreshOrders: () => void | Promise<void>
}) {
  const symbolKey = positions.map((position) => position.symbol).join(',')
  const { data: quotes, isLoading, mutate } = useSWR<QuoteMap>(
    symbolKey ? `portfolio-quotes:${symbolKey}` : null,
    async () => {
      const entries = await Promise.all(positions.map(async (position) => {
        try {
          return [position.symbol, await fetchStockQuote(position.symbol)] as const
        } catch {
          return [position.symbol, null] as const
        }
      }))
      return Object.fromEntries(entries)
    },
    { refreshInterval: 30_000, revalidateOnFocus: true },
  )

  const investedAmount = positions.reduce((sum, position) => sum + position.averagePrice * position.quantity, 0)
  const currentValues = positions.map((position) => {
    const currentPrice = parseQuoteNumber(quotes?.[position.symbol]?.stck_prpr)
    return Number.isFinite(currentPrice) ? currentPrice * position.quantity : null
  })
  const quotesReady = positions.length > 0 && currentValues.every((value) => value !== null)
  const marketValue = quotesReady ? currentValues.reduce<number>((sum, value) => sum + (value ?? 0), 0) : Number.NaN
  const profitLoss = marketValue - investedAmount
  const profitRate = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0
  const missingQuotes = positions.length - currentValues.filter((value) => value !== null).length
  const profitTone = profitLoss > 0 ? 'up' : profitLoss < 0 ? 'down' : 'neutral'
  const ProfitIcon = profitLoss < 0 ? ArrowDownRight : ArrowUpRight
  const quoteStatus = positions.length === 0 ? '보유종목 시세 조회 대기' : missingQuotes > 0 ? '일부 시세 연결 대기 중' : '시세 동기화 완료'
  const quoteStatusDot = positions.length === 0 ? 'bg-slate-300' : missingQuotes > 0 ? 'bg-amber-400' : 'bg-emerald-500'

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pt-9">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold tracking-[-0.05em] text-slate-900 sm:text-[27px]">보유종목</h1>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">모의투자</span>
          </div>
          <p className="mt-2 text-[12px] text-slate-500 sm:text-[13px]">체결 완료된 매수 주문과 현재 시세를 기준으로 보유 자산을 확인합니다.</p>
        </div>
        <button
          type="button"
          onClick={() => void mutate()}
          disabled={isLoading}
          className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> 시세 새로고침
        </button>
      </div>

      <section aria-label="보유 자산 요약" className="mb-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3 xl:gap-4">
        <SummaryCard label="총 매입금액" value={ordersLoading && positions.length === 0 ? '조회 중' : ordersError && positions.length === 0 ? '—' : formatWon(investedAmount)} detail="체결된 주문의 평균 매입가 기준" />
        <SummaryCard label="총 평가금액" value={quotesReady ? formatWon(marketValue) : '—'} detail={missingQuotes > 0 ? `현재가 ${missingQuotes}건 조회 필요` : '보유 수량 × 현재가'} />
        <SummaryCard
          label="평가손익"
          value={quotesReady ? `${profitLoss > 0 ? '+' : ''}${formatWon(profitLoss)}` : '—'}
          detail={quotesReady ? `${profitLoss > 0 ? '+' : ''}${profitRate.toFixed(2)}%` : '시세 조회 후 계산'}
          tone={profitTone}
        />
      </section>

      {ordersError && positions.length > 0 && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-amber-800"><span>주문 목록을 새로고침하지 못했습니다. 표시된 보유종목은 마지막으로 불러온 데이터입니다.</span><button type="button" onClick={() => void onRefreshOrders()} className="font-semibold underline underline-offset-2">다시 시도</button></div>}
      <section aria-labelledby="portfolio-holdings-heading" className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BriefcaseBusiness size={16} aria-hidden="true" /></div>
            <div>
              <h2 id="portfolio-holdings-heading" className="text-[14px] font-bold tracking-[-0.02em] text-slate-900">내 보유종목</h2>
              <p className="mt-0.5 text-[10px] text-slate-400">총 {positions.length.toLocaleString('ko-KR')}개 종목 · 현재가 30초마다 갱신</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">완료된 매수 주문만 반영</span>
        </div>

        {ordersLoading && positions.length === 0 ? (
          <div role="status" className="flex min-h-[240px] items-center justify-center text-[12px] text-slate-500"><RefreshCw size={15} className="mr-2 animate-spin" aria-hidden="true" />주문 데이터를 불러오는 중입니다.</div>
        ) : ordersError && positions.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-amber-50 text-amber-600"><BriefcaseBusiness size={19} aria-hidden="true" /></div>
            <h3 className="mt-4 text-[13px] font-semibold text-slate-800">보유종목을 불러오지 못했습니다</h3>
            <p role="alert" className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-slate-500">{ordersError}</p>
            <button type="button" onClick={() => void onRefreshOrders()} className="mt-4 inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50">다시 시도</button>
          </div>
        ) : positions.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><BriefcaseBusiness size={20} aria-hidden="true" /></div>
            <h3 className="mt-4 text-[13px] font-semibold text-slate-800">체결 완료된 보유종목이 없습니다</h3>
            <p className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-slate-500">주문이 접수된 뒤 처리 완료 상태가 되면 이곳에 종목과 평가손익이 표시됩니다.</p>
            <button type="button" onClick={onNewOrder} className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#1d64d8] px-3.5 text-[11px] font-semibold text-white transition hover:bg-[#1858c1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">모의 주문하기</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-semibold text-slate-500">
                  <th scope="col" className="px-5 py-3.5">종목</th>
                  <th scope="col" className="px-4 py-3.5 text-right">보유 수량</th>
                  <th scope="col" className="px-4 py-3.5 text-right">평균 매입가</th>
                  <th scope="col" className="px-4 py-3.5 text-right">현재가</th>
                  <th scope="col" className="px-4 py-3.5 text-right">평가금액</th>
                  <th scope="col" className="px-5 py-3.5 text-right">평가손익</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {positions.map((position, index) => {
                  const currentPrice = parseQuoteNumber(quotes?.[position.symbol]?.stck_prpr)
                  const currentValue = Number.isFinite(currentPrice) ? currentPrice * position.quantity : Number.NaN
                  const positionProfit = currentValue - position.averagePrice * position.quantity
                  const positionRate = position.averagePrice > 0 ? (positionProfit / (position.averagePrice * position.quantity)) * 100 : 0
                  const positionTone = positionProfit > 0 ? 'text-rose-600' : positionProfit < 0 ? 'text-blue-600' : 'text-slate-500'
                  const RowProfitIcon = positionProfit < 0 ? ArrowDownRight : ArrowUpRight
                  return (
                    <tr key={position.symbol} className="transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${index % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>{position.name.slice(0, 1)}</span>
                          <span><span className="block text-[12px] font-semibold text-slate-800">{position.name}</span><span className="mt-0.5 block font-mono text-[10px] text-slate-400">{position.symbol}</span></span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-[11px] tabular-nums text-slate-700">{numberFormat.format(position.quantity)}주</td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-[11px] tabular-nums text-slate-700">{formatWon(position.averagePrice)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-[11px] tabular-nums text-slate-700">{isLoading && !quotes?.[position.symbol] ? '조회 중' : formatWon(currentPrice)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-[11px] tabular-nums text-slate-700">{formatWon(currentValue)}</td>
                      <td className={`whitespace-nowrap px-5 py-4 text-right font-mono text-[11px] font-semibold tabular-nums ${positionTone}`}>
                        <span className="inline-flex items-center justify-end gap-1"><RowProfitIcon size={13} aria-hidden="true" />{Number.isFinite(positionProfit) ? `${positionProfit > 0 ? '+' : ''}${formatWon(positionProfit)}` : '—'}</span>
                        <span className="mt-0.5 block text-[9px] font-medium">{Number.isFinite(positionProfit) ? `${positionRate > 0 ? '+' : ''}${positionRate.toFixed(2)}%` : '—'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <footer className="mt-5 flex flex-col items-start justify-between gap-2 px-1 text-[10px] text-slate-400 sm:flex-row sm:items-center">
        <p>모의투자 데이터는 실제 자산이나 주문 결과가 아닙니다.</p>
        <p className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${quoteStatusDot}`} />{quoteStatus}</p>
      </footer>
    </div>
  )
}
