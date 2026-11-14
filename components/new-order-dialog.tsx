'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { CircleDollarSign, PackagePlus, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchStocks, type StockSearchItem } from '@/lib/stock-search'

export type NewOrderPayload = {
  symbol: string
  name: string
  quantity: number
  price: number
}

type NewOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (order: NewOrderPayload) => void
}

type OrderFormErrors = Partial<Record<keyof NewOrderPayload, string>>

const MAX_VISIBLE_STOCKS = 12

export function NewOrderDialog({ open, onOpenChange, onSubmit }: NewOrderDialogProps) {
  const [stockQuery, setStockQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockSearchItem | null>(null)
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<OrderFormErrors>({})
  const stockResults = useMemo(() => searchStocks(stockQuery), [stockQuery])
  const visibleStocks = stockResults.slice(0, MAX_VISIBLE_STOCKS)

  useEffect(() => {
    if (open) {
      setStockQuery('')
      setSelectedStock(null)
      setQuantity('')
      setPrice('')
      setErrors({})
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setErrors({})
    onOpenChange(nextOpen)
  }

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedSymbol = selectedStock?.code ?? ''
    const selectedStockName = selectedStock?.name ?? ''
    const parsedQuantity = Number(quantity)
    const parsedPrice = Number(price)
    const nextErrors: OrderFormErrors = {}

    if (!selectedStock) nextErrors.symbol = '검색 결과에서 종목을 선택해 주세요.'
    if (!quantity || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      nextErrors.quantity = '수량은 1 이상의 정수로 입력해 주세요.'
    }
    if (!price || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = '주문 가격은 0보다 큰 숫자로 입력해 주세요.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // 1. 백엔드 전송용 데이터 객체 생성 (요청하신 JSON 형태)
    const requestBody = {
      orderId: 'ORD-' + Date.now(), // 고유 주문번호 생성 (예: ORD-1718...)
      symbol: normalizedSymbol,
      quantity: parsedQuantity,
      price: parsedPrice,
    }

    try {
      // 2. 백엔드 POST /orders API 호출
      const response = await fetch('http://localhost:8080/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('주문 등록 실패')
      }

      const savedOrder = await response.json()
      console.log('백엔드 저장 성공:', savedOrder)

      // 3. 부모 컴포넌트에 알림 및 모달 닫기
      onSubmit({ symbol: normalizedSymbol, name: selectedStockName, quantity: parsedQuantity, price: parsedPrice })
      onOpenChange(false)
      
      // 4. (선택) 등록 직후 목록을 새로고침하기 위해 페이지 새로고침 또는 목록 불러오기 함수 호출
      window.location.reload() 

    } catch (error) {
      console.error('주문 등록 중 오류 발생:', error)
      alert('주문 등록에 실패했습니다. 백엔드 서버 상태를 확인해 주세요.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <PackagePlus size={19} aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="text-[16px] font-bold tracking-[-0.03em] text-slate-900">신규 주문 등록</Dialog.Title>
                <Dialog.Description className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  종목과 주문 정보를 입력해 주세요.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close aria-label="모달 닫기" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <X size={17} aria-hidden="true" />
            </Dialog.Close>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="flex flex-col gap-5 px-5 py-6 sm:px-6">
              <legend className="sr-only">신규 주문 정보</legend>
              <div className="flex flex-col gap-2">
                <label htmlFor="order-symbol" className="text-[12px] font-semibold text-slate-700">종목 선택 <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    id="order-symbol"
                    name="symbol-search"
                    type="search"
                    autoComplete="off"
                    placeholder="종목명 또는 종목코드 검색"
                    value={stockQuery}
                    onChange={(event) => {
                      setStockQuery(event.target.value)
                      setSelectedStock(null)
                      setErrors((current) => ({ ...current, symbol: undefined }))
                    }}
                    aria-invalid={Boolean(errors.symbol)}
                    aria-describedby={errors.symbol ? 'order-symbol-error' : 'order-symbol-help'}
                    className="h-11 rounded-xl border-slate-200 pl-9 text-[13px] placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100"
                  />
                </div>
                {selectedStock && (
                  <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-slate-800">{selectedStock.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-500">{selectedStock.code} · {selectedStock.market}</span>
                    </span>
                    <button type="button" onClick={() => setSelectedStock(null)} className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">변경</button>
                  </div>
                )}
                {!stockQuery.trim() && !selectedStock && (
                  <p id="order-symbol-help" className="text-[11px] text-slate-400">KOSPI·KOSDAQ·KONEX 전체 종목에서 검색 후 선택</p>
                )}
                {stockQuery.trim() && stockResults.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <p className="px-3 py-2 text-[10px] font-medium text-slate-400">
                      검색 결과 {stockResults.length.toLocaleString('ko-KR')}개{stockResults.length > visibleStocks.length ? ` · 상위 ${visibleStocks.length}개 표시` : ''}
                    </p>
                    <ul aria-label="종목 선택 결과" className="flex max-h-52 flex-col overflow-y-auto border-t border-slate-100 p-1">
                      {visibleStocks.map((stock) => (
                        <li key={stock.code}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStock(stock)
                              setStockQuery('')
                              setErrors((current) => ({ ...current, symbol: undefined }))
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12px] font-semibold text-slate-800">{stock.name}</span>
                              <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{stock.code}</span>
                            </span>
                            <span className="shrink-0 text-[10px] font-medium text-slate-400">{stock.market}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {stockQuery.trim() && stockResults.length === 0 && (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] text-slate-500">검색된 종목이 없습니다.</p>
                )}
                {errors.symbol && <p id="order-symbol-error" className="text-[11px] font-medium text-rose-600" role="alert">{errors.symbol}</p>}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="order-quantity" className="text-[12px] font-semibold text-slate-700">수량 <span className="text-rose-500">*</span></label>
                  <Input
                    id="order-quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    placeholder="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    aria-invalid={Boolean(errors.quantity)}
                    aria-describedby={errors.quantity ? 'order-quantity-error' : 'order-quantity-help'}
                    className="h-11 rounded-xl border-slate-200 text-[13px] tabular-nums focus-visible:border-blue-400 focus-visible:ring-blue-100"
                  />
                  {errors.quantity ? <p id="order-quantity-error" className="text-[11px] font-medium text-rose-600" role="alert">{errors.quantity}</p> : <p id="order-quantity-help" className="text-[11px] text-slate-400">1주 이상 입력</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="order-price" className="text-[12px] font-semibold text-slate-700">주문 가격 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <CircleDollarSign size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="order-price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="any"
                      inputMode="decimal"
                      placeholder="0"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      aria-invalid={Boolean(errors.price)}
                      aria-describedby={errors.price ? 'order-price-error' : 'order-price-help'}
                      className="h-11 rounded-xl border-slate-200 pl-9 text-[13px] tabular-nums focus-visible:border-blue-400 focus-visible:ring-blue-100"
                    />
                  </div>
                  {errors.price ? <p id="order-price-error" className="text-[11px] font-medium text-rose-600" role="alert">{errors.price}</p> : <p id="order-price-help" className="text-[11px] text-slate-400">원 단위로 입력</p>}
                </div>
              </div>
            </fieldset>

            <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button type="button" onClick={() => onOpenChange(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                취소
              </button>
              <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1d64d8] px-4 text-[12px] font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-[#1858c1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <PackagePlus size={15} aria-hidden="true" /> 주문하기
              </button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
