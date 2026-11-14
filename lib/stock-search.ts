export type StockSearchItem = {
  code: string
  name: string
}

export const STOCK_SEARCH_ITEMS: StockSearchItem[] = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
]

export function searchStocks(query: string): StockSearchItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR')

  if (!normalizedQuery) return []

  return STOCK_SEARCH_ITEMS.filter((stock) =>
    stock.name.toLocaleLowerCase('ko-KR').includes(normalizedQuery) ||
    stock.code.includes(normalizedQuery),
  )
}
