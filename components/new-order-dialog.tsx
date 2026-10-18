'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { CircleDollarSign, Hash, PackagePlus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

export type NewOrderPayload = {
  symbol: string
  quantity: number
  price: number
}

type NewOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (order: NewOrderPayload) => void
}

type OrderFormErrors = Partial<Record<keyof NewOrderPayload, string>>

export function NewOrderDialog({ open, onOpenChange, onSubmit }: NewOrderDialogProps) {
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<OrderFormErrors>({})

  useEffect(() => {
    if (open) {
      setSymbol('')
      setQuantity('')
      setPrice('')
      setErrors({})
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setErrors({})
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedSymbol = symbol.trim()
    const parsedQuantity = Number(quantity)
    const parsedPrice = Number(price)
    const nextErrors: OrderFormErrors = {}

    if (!normalizedSymbol) nextErrors.symbol = '종목 코드 또는 이름을 입력해 주세요.'
    if (!quantity || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      nextErrors.quantity = '수량은 1 이상의 정수로 입력해 주세요.'
    }
    if (!price || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = '주문 가격은 0보다 큰 숫자로 입력해 주세요.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({ symbol: normalizedSymbol, quantity: parsedQuantity, price: parsedPrice })
    onOpenChange(false)
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
                <label htmlFor="order-symbol" className="text-[12px] font-semibold text-slate-700">종목 코드 / 이름 <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Hash size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    id="order-symbol"
                    name="symbol"
                    autoComplete="off"
                    placeholder="예: 005930 또는 삼성전자"
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                    aria-invalid={Boolean(errors.symbol)}
                    aria-describedby={errors.symbol ? 'order-symbol-error' : undefined}
                    className="h-11 rounded-xl border-slate-200 pl-9 text-[13px] placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100"
                  />
                </div>
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
