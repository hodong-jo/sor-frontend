'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChartCandlestick,
  CircleAlert,
  Minus,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-react'
import { fetchStockQuote, type StockQuote } from '@/lib/market-stocks'
import { searchStocks, STOCK_MASTER_UPDATED_AT, STOCK_SEARCH_ITEMS, type StockSearchItem } from '@/lib/stock-search'

const numberFormat = new Intl.NumberFormat('ko-KR')

type PriceTrend = 'up' | 'down' | 'flat'

function parseQuoteNumber(value: string | number): number {
  const parsed = Number(String(value).replaceAll(',', '').replace(/^\+/, '').trim())
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatQuoteNumber(value: string | number): string {
  const number = parseQuoteNumber(value)
  return Number.isFinite(number) ? numberFormat.format(number) : '-'
}

function formatSignedNumber(value: string | number): string {
  const number = parseQuoteNumber(value)
  if (!Number.isFinite(number)) return '-'
  return `${number > 0 ? '+' : ''}${numberFormat.format(number)}`
}

function getPriceTrend(value: string | number): PriceTrend {
  const number = parseQuoteNumber(value)
  if (number > 0) return 'up'
  if (number < 0) return 'down'
  return 'flat'
}

const trendStyles: Record<PriceTrend, { text: string; icon: typeof Minus; label: string }> = {
  up: { text: 'text-rose-600', icon: ArrowUpRight, label: '상승' },
  down: { text: 'text-blue-600', icon: ArrowDownRight, label: '하락' },
  flat: { text: 'text-slate-500', icon: Minus, label: '보합' },
}

function StockSearchResults({
  query,
  selectedStock,
  onSelect,
}: {
  query: string
  selectedStock: StockSearchItem | null
  onSelect: (stock: StockSearchItem) => void
}) {
  const results = useMemo(() => searchStocks(query), [query])
  const visibleResults = results.slice(0, 30)

  if (!query.trim()) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center">
        <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80">
          <Search size={16} aria-hidden="true" />
        </div>
        <p className="mt-3 text-[12px] font-semibold text-slate-700">종목명 또는 종목코드를 검색해 주세요</p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
          KIS 마스터 기준 KOSPI·KOSDAQ·KONEX 전체 {STOCK_SEARCH_ITEMS.length.toLocaleString('ko-KR')}종목
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-5 text-center">
        <p className="text-[12px] font-semibold text-slate-700">검색된 종목이 없습니다</p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
          종목명이나 종목코드를 다시 확인해 주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10px] font-semibold text-slate-400">
        검색 결과 {results.length.toLocaleString('ko-KR')}개{results.length > visibleResults.length ? ` · 상위 ${visibleResults.length}개 표시` : ''}
      </p>
      <ul aria-label="종목 검색 결과" className="flex flex-col gap-2">
        {visibleResults.map((stock) => {
          const isSelected = selectedStock?.code === stock.code
          return (
            <li key={stock.code}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(stock)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected ? 'border-blue-200 bg-blue-50/70' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'}`}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Building2 size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-slate-800">{stock.name}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{stock.code}</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400">{stock.market} · 시세 보기</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function QuoteMetric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3.5 py-3">
      <dt className="text-[10px] font-medium text-slate-400">{label}</dt>
      <dd className="mt-1.5 font-mono text-[13px] font-semibold tabular-nums text-slate-700">
        {value}<span className="ml-1 text-[10px] font-medium text-slate-400">{unit}</span>
      </dd>
    </div>
  )
}

function QuoteDetails({ stock, quote }: { stock: StockSearchItem; quote: StockQuote }) {
  const trend = getPriceTrend(quote.prdy_vrss)
  const trendStyle = trendStyles[trend]
  const TrendIcon = trendStyle.icon
  const rate = parseQuoteNumber(quote.prdy_ctrt)
  const rateText = Number.isFinite(rate) ? `${rate > 0 ? '+' : ''}${rate.toFixed(2)}%` : '-'

  return (
    <div aria-live="polite" className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-slate-900">{stock.name}</h3>
            <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">{stock.code}</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">현재 선택한 종목의 백엔드 시세</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${trend === 'up' ? 'bg-rose-50 text-rose-700' : trend === 'down' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
          <TrendingUp size={12} aria-hidden="true" /> 전일 대비
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-medium text-slate-400">현재가</p>
          <p className={`mt-1.5 font-mono text-[27px] font-bold leading-none tracking-[-0.04em] tabular-nums sm:text-[31px] ${trendStyle.text}`}>
            ₩{formatQuoteNumber(quote.stck_prpr)}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 pb-0.5 font-mono text-[12px] font-semibold tabular-nums ${trendStyle.text}`}>
          <TrendIcon size={15} aria-hidden="true" />
          <span>{formatSignedNumber(quote.prdy_vrss)}</span>
          <span>({rateText})</span>
          <span className="sr-only">전일 대비 {trendStyle.label}</span>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <QuoteMetric label="시가" value={formatQuoteNumber(quote.stck_oprc)} unit="원" />
        <QuoteMetric label="고가" value={formatQuoteNumber(quote.stck_hgpr)} unit="원" />
        <QuoteMetric label="저가" value={formatQuoteNumber(quote.stck_lwpr)} unit="원" />
        <QuoteMetric label="누적 거래량" value={formatQuoteNumber(quote.acml_vol)} unit="주" />
      </dl>
    </div>
  )
}

export function StockMarketPanel() {
  const [query, setQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockSearchItem | null>(null)
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestController = useRef<AbortController | null>(null)

  useEffect(() => () => requestController.current?.abort(), [])

  async function selectStock(stock: StockSearchItem) {
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller
    setQuery(stock.name)
    setSelectedStock(stock)
    setQuote(null)
    setError('')
    setLoading(true)

    try {
      const nextQuote = await fetchStockQuote(stock.code, controller.signal)
      setQuote(nextQuote)
    } catch (requestError) {
      if (controller.signal.aborted) return
      setError(
        requestError instanceof TypeError
          ? '시세 서버에 연결할 수 없습니다. 백엔드(localhost:8080) 실행 상태를 확인해 주세요.'
          : requestError instanceof Error
            ? requestError.message
            : '시세 정보를 불러오지 못했습니다.',
      )
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return (
    <section aria-labelledby="stock-market-heading" className="mb-6 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><ChartCandlestick size={16} aria-hidden="true" /></div>
          <div>
            <h2 id="stock-market-heading" className="text-[14px] font-bold tracking-[-0.02em] text-slate-900">종목 검색 · 시세 조회</h2>
            <p className="mt-0.5 text-[10px] text-slate-400">KIS 종목 마스터 {STOCK_MASTER_UPDATED_AT} 기준 · 종목 선택 시 백엔드 시세 조회</p>
          </div>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">전체 종목 {STOCK_SEARCH_ITEMS.length.toLocaleString('ko-KR')}개</span>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.45fr)] lg:gap-6">
        <div>
          <label htmlFor="stock-search" className="mb-2 block text-[11px] font-semibold text-slate-600">종목명 또는 종목코드</label>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="stock-search"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: 삼성전자, 005930"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <StockSearchResults query={query} selectedStock={selectedStock} onSelect={selectStock} />
        </div>

        <div className="min-h-[250px] rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5">
          {!selectedStock ? (
            <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80"><ChartCandlestick size={20} aria-hidden="true" /></div>
              <h3 className="mt-3 text-[12px] font-semibold text-slate-700">조회할 종목을 선택해 주세요</h3>
              <p className="mt-1 max-w-[260px] text-[10px] leading-relaxed text-slate-400">종목 검색 결과를 선택하면 현재가와 주요 시세 정보를 표시합니다.</p>
            </div>
          ) : loading ? (
            <div role="status" className="flex min-h-[210px] flex-col items-center justify-center text-center">
              <RefreshCw size={20} className="animate-spin text-blue-600" aria-hidden="true" />
              <p className="mt-3 text-[12px] font-semibold text-slate-700">{selectedStock.name} 시세 조회 중</p>
              <p className="mt-1 font-mono text-[10px] text-slate-400">{selectedStock.code}</p>
              <span className="sr-only">시세 정보를 불러오는 중입니다.</span>
            </div>
          ) : error ? (
            <div role="alert" className="flex min-h-[210px] flex-col items-center justify-center text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600"><CircleAlert size={18} aria-hidden="true" /></div>
              <h3 className="mt-3 text-[12px] font-semibold text-slate-800">시세를 불러오지 못했습니다</h3>
              <p className="mt-1 max-w-sm text-[10px] leading-relaxed text-slate-500">{error}</p>
              <button type="button" onClick={() => selectStock(selectedStock)} className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <RefreshCw size={12} aria-hidden="true" /> 다시 시도
              </button>
            </div>
          ) : quote ? (
            <QuoteDetails stock={selectedStock} quote={quote} />
          ) : null}
        </div>
      </div>
    </section>
  )
}
