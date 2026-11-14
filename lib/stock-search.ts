import stockMaster from './kis-stock-master.json'

export type StockMarket = 'KOSPI' | 'KOSDAQ' | 'KONEX'

export type StockSearchItem = {
  code: string
  name: string
  market: StockMarket
}

export const STOCK_SEARCH_ITEMS = stockMaster.items as StockSearchItem[]
export const STOCK_MASTER_UPDATED_AT = stockMaster.updatedAt

const stocksByCode = new Map(STOCK_SEARCH_ITEMS.map((stock) => [stock.code, stock]))

export function getStockByCode(code: string): StockSearchItem | undefined {
  return stocksByCode.get(code)
}

export function searchStocks(query: string): StockSearchItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR')

  if (!normalizedQuery) return []

  return STOCK_SEARCH_ITEMS.filter((stock) =>
    stock.name.toLocaleLowerCase('ko-KR').includes(normalizedQuery) ||
    stock.code.toLocaleLowerCase('ko-KR').includes(normalizedQuery),
  ).sort((first, second) => {
    const firstStartsWith = first.name.toLocaleLowerCase('ko-KR').startsWith(normalizedQuery) ||
      first.code.toLocaleLowerCase('ko-KR').startsWith(normalizedQuery)
    const secondStartsWith = second.name.toLocaleLowerCase('ko-KR').startsWith(normalizedQuery) ||
      second.code.toLocaleLowerCase('ko-KR').startsWith(normalizedQuery)

    return Number(secondStartsWith) - Number(firstStartsWith)
  })
}
