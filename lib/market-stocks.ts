export type StockQuote = {
  stck_prpr: string | number
  prdy_vrss: string | number
  prdy_ctrt: string | number
  stck_oprc: string | number
  stck_hgpr: string | number
  stck_lwpr: string | number
  acml_vol: string | number
}

const STOCK_API_BASE_URL = 'http://localhost:8080'

function isQuoteValue(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

export async function fetchStockQuote(
  stockCode: string,
  signal?: AbortSignal,
): Promise<StockQuote> {
  const response = await fetch(
    `${STOCK_API_BASE_URL}/market/stocks/${encodeURIComponent(stockCode)}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(`시세 조회에 실패했습니다. (HTTP ${response.status})`)
  }

  const data: unknown = await response.json()
  const fields: (keyof StockQuote)[] = [
    'stck_prpr',
    'prdy_vrss',
    'prdy_ctrt',
    'stck_oprc',
    'stck_hgpr',
    'stck_lwpr',
    'acml_vol',
  ]

  if (
    typeof data !== 'object' ||
    data === null ||
    !fields.every((field) => isQuoteValue((data as Record<string, unknown>)[field]))
  ) {
    throw new Error('시세 응답 형식이 올바르지 않습니다.')
  }

  return data as StockQuote
}
