'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Command,
  LayoutDashboard,
  ListFilter,
  Menu,
  MoreHorizontal,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  X,
} from 'lucide-react'
import { orders, statusFilters, type Order, type OrderStatus } from '@/lib/orders'

const numberFormat = new Intl.NumberFormat('ko-KR')
const pageSize = 8

const statusStyles: Record<OrderStatus, string> = {
  접수: 'bg-sky-50 text-sky-700 ring-sky-200',
  '검증 완료': 'bg-amber-50 text-amber-700 ring-amber-200',
  '라우팅 완료': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  거절: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  )
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {mobileOpen && <button aria-label="메뉴 닫기" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col bg-[#101b2d] text-slate-300 transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#1f6feb] text-white shadow-lg shadow-blue-950/30">
              <Activity size={19} strokeWidth={2.2} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-[-0.03em] text-white">SOR Console</p>
              <p className="mt-0.5 text-[10px] font-medium tracking-[0.14em] text-slate-500">스마트 주문 라우팅 운영</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="메뉴 닫기" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden"><X size={18} /></button>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 pb-3 text-[10px] font-bold tracking-[0.16em] text-slate-500">메인 메뉴</p>
          <nav aria-label="주요 메뉴" className="flex flex-col gap-1">
            <button className="flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
              <LayoutDashboard size={17} aria-hidden="true" /> 대시보드
            </button>
            <button aria-current="page" className="relative flex h-11 items-center gap-3 rounded-lg bg-[#1f6feb]/15 px-3 text-[13px] font-semibold text-[#79aaff]">
              <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#4389ff]" />
              <ListFilter size={17} aria-hidden="true" /> 주문 관리
              <span className="ml-auto rounded-md bg-[#1f6feb]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#8bb5ff]">128</span>
            </button>
            <button className="flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
              <Radio size={17} aria-hidden="true" /> 라우팅 현황
            </button>
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-emerald-400" /></span>
              <span className="text-[11px] font-semibold text-emerald-300">모든 시스템 정상</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">라우팅 엔진과 거래소 연결이<br />안정적으로 운영 중입니다.</p>
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-slate-500"><span>마지막 점검</span><span className="font-mono text-slate-400">14:32:18</span></div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-700 text-[11px] font-bold text-white">김</div>
            <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-slate-200">김도현</p><p className="mt-0.5 text-[10px] text-slate-500">운영 관리자</p></div>
            <MoreHorizontal size={16} className="text-slate-500" aria-hidden="true" />
          </div>
        </div>
      </aside>
    </>
  )
}

function SummaryCard({ label, value, note, icon: Icon, tone, trend }: {
  label: string
  value: string
  note: string
  icon: typeof Activity
  tone: 'blue' | 'amber' | 'green' | 'red'
  trend?: string
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600',
  }
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-[27px] font-bold leading-none tracking-[-0.045em] text-slate-900">{value}<span className="ml-1.5 text-[13px] font-medium tracking-normal text-slate-400">건</span></p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={18} strokeWidth={1.9} aria-hidden="true" /></div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
        {trend ? <><span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600"><ArrowUpRight size={13} />{trend}</span><span>전일 대비</span></> : <span>{note}</span>}
      </div>
    </article>
  )
}

function OrdersTable({ rows }: { rows: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse text-left">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500">
            <th scope="col" className="px-5 py-3.5">주문번호</th>
            <th scope="col" className="px-4 py-3.5">종목코드</th>
            <th scope="col" className="px-4 py-3.5 text-right">수량</th>
            <th scope="col" className="px-4 py-3.5 text-right">주문가격</th>
            <th scope="col" className="px-4 py-3.5">주문상태</th>
            <th scope="col" className="px-4 py-3.5">접수시간</th>
            <th scope="col" className="px-4 py-3.5"><span className="sr-only">주문 메뉴</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((order) => (
            <tr key={order.id} className="group transition-colors hover:bg-slate-50/80">
              <td className="whitespace-nowrap px-5 py-[15px]"><span className="font-mono text-[11px] font-semibold tracking-[-0.02em] text-slate-700">{order.id}</span></td>
              <td className="px-4 py-[13px]"><div className="flex items-center gap-2.5"><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${order.side === '매수' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{order.side}</span><div><p className="whitespace-nowrap text-[12px] font-semibold text-slate-800">{order.name}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">{order.symbol}</p></div></div></td>
              <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-[12px] font-medium tabular-nums text-slate-700">{numberFormat.format(order.quantity)}주</td>
              <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-[12px] font-semibold tabular-nums text-slate-800">₩{numberFormat.format(order.price)}</td>
              <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={order.status} /></td>
              <td className="whitespace-nowrap px-4 py-4 font-mono text-[11px] tabular-nums text-slate-500">{order.time}</td>
              <td className="px-3 py-4 text-right"><button aria-label={`${order.id} 상세 메뉴`} className="rounded-md p-1.5 text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 focus:opacity-100"><MoreHorizontal size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function OrderManagementDashboard() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<(typeof statusFilters)[number]>('전체')
  const [page, setPage] = useState(1)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus = activeFilter === '전체' || order.status === activeFilter
      const matchesQuery = !normalizedQuery || order.id.toLowerCase().includes(normalizedQuery) || order.symbol.includes(normalizedQuery) || order.name.toLowerCase().includes(normalizedQuery)
      return matchesStatus && matchesQuery
    })
  }, [activeFilter, query])

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize)

  function changeFilter(filter: (typeof statusFilters)[number]) {
    setActiveFilter(filter)
    setPage(1)
  }

  function changeQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="메뉴 열기" className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"><Menu size={18} /></button>
            <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex"><span>운영 콘솔</span><span className="text-slate-300">/</span><span className="font-medium text-slate-600">주문 관리</span></div>
            <div className="sm:hidden"><p className="text-[14px] font-bold text-slate-900">주문 관리</p></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-1.5 sm:flex"><span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" /><span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" /></span><span className="text-[11px] font-semibold text-emerald-700">시스템 정상</span></div>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <button aria-label="알림" className="relative flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"><Bell size={17} /><span className="absolute right-[8px] top-[7px] size-1.5 rounded-full border border-white bg-rose-500" /></button>
            <button className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 sm:flex"><Command size={13} /> 콘솔 <ChevronDown size={13} className="text-slate-400" /></button>
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-700 text-[11px] font-bold text-white lg:hidden">김</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pt-9">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-400 sm:hidden"><span>운영 콘솔</span><span>/</span><span>주문</span></div>
              <div className="flex items-center gap-3">
                <h1 className="text-[24px] font-bold tracking-[-0.05em] text-slate-900 sm:text-[27px]">주문 관리</h1>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">실시간</span>
              </div>
              <p className="mt-2 text-[12px] text-slate-500 sm:text-[13px]">주문 접수부터 라우팅까지 한눈에 확인하고 관리합니다.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="mr-1 hidden text-[11px] text-slate-400 md:inline">2026년 10월 18일 · 일요일</span>
              <button onClick={() => { setNotice('주문 목록을 새로고침했습니다.'); window.setTimeout(() => setNotice(''), 2600) }} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"><RefreshCw size={14} /> 새로고침</button>
              <button onClick={() => { setNotice('주문 내역 내보내기를 준비했습니다.'); window.setTimeout(() => setNotice(''), 2600) }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#1d64d8] px-3 text-[11px] font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-[#1858c1]"><ArrowDownToLine size={14} /> 내보내기</button>
            </div>
          </div>

          {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-700"><Check size={14} />{notice}</div>}

          <section aria-label="주문 요약" className="mb-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
            <SummaryCard label="전체 주문" value="128" note="오늘 접수된 전체 주문" icon={Activity} tone="blue" trend="12.8%" />
            <SummaryCard label="접수" value="24" note="검증 대기 중인 주문" icon={Clock3} tone="amber" />
            <SummaryCard label="라우팅 완료" value="89" note="정상 체결 경로 배정" icon={ShieldCheck} tone="green" trend="8.2%" />
            <SummaryCard label="거절" value="15" note="확인 및 조치가 필요한 주문" icon={CircleAlert} tone="red" />
          </section>

          <section aria-labelledby="orders-heading" className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
            <div className="flex flex-col gap-4 px-4 pb-4 pt-5 sm:px-5 sm:pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><TrendingUp size={16} /></div>
                <div><h2 id="orders-heading" className="text-[14px] font-bold tracking-[-0.02em] text-slate-900">주문 목록</h2><p className="mt-0.5 text-[10px] text-slate-400">최근 주문 내역을 확인할 수 있습니다.</p></div>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative flex h-9 min-w-0 flex-1 items-center sm:w-[245px] sm:flex-none">
                  <Search size={15} className="pointer-events-none absolute left-3 text-slate-400" aria-hidden="true" />
                  <input value={query} onChange={(event) => changeQuery(event.target.value)} type="search" aria-label="주문 검색" placeholder="주문번호 또는 종목코드" className="h-full w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  {query && <button onClick={() => changeQuery('')} aria-label="검색어 지우기" className="absolute right-2 flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><X size={13} /></button>}
                </label>
                <button aria-label="주문 필터 설정" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"><SlidersHorizontal size={15} /></button>
                <button aria-label="신규 주문" onClick={() => { setNotice('신규 주문 접수는 운영 시스템에서 진행해 주세요.'); window.setTimeout(() => setNotice(''), 2600) }} className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1d64d8] text-white transition hover:bg-[#1858c1] sm:hidden"><Plus size={16} /></button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 overflow-x-auto border-b border-slate-100 px-4 sm:px-5">
              <div role="tablist" aria-label="주문 상태 필터" className="flex min-w-max items-center gap-5 sm:gap-6">
                {statusFilters.map((filter) => {
                  const count = filter === '전체' ? orders.length : orders.filter((order) => order.status === filter).length
                  return <button key={filter} role="tab" aria-selected={activeFilter === filter} onClick={() => changeFilter(filter)} className={`relative flex h-11 items-center gap-1.5 text-[11px] font-medium transition-colors ${activeFilter === filter ? 'font-semibold text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>
                    {filter}<span className={`text-[10px] tabular-nums ${activeFilter === filter ? 'text-blue-600' : 'text-slate-400'}`}>{count}</span>{activeFilter === filter && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />}
                  </button>
                })}
              </div>
              <span className="hidden shrink-0 items-center gap-1.5 pb-0.5 text-[10px] text-slate-400 md:inline-flex"><span className="size-1.5 rounded-full bg-emerald-500" />실시간 업데이트</span>
            </div>

            {visibleOrders.length > 0 ? <OrdersTable rows={visibleOrders} /> : (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Search size={19} /></div>
                <p className="text-[13px] font-semibold text-slate-700">검색 결과가 없습니다</p>
                <p className="mt-1.5 max-w-xs text-[11px] leading-relaxed text-slate-400">검색어 또는 상태 필터를 변경한 뒤 다시 확인해 주세요.</p>
                <button onClick={() => { changeQuery(''); changeFilter('전체') }} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">필터 초기화</button>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[10px] text-slate-500"><span className="font-semibold text-slate-700">{filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredOrders.length)}</span>건 표시 <span className="mx-1 text-slate-300">·</span> 총 <span className="font-semibold text-slate-700">{filteredOrders.length}</span>건</p>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="mr-2 text-[10px] text-slate-400">페이지당 {pageSize}건</span>
                <button aria-label="이전 페이지" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={14} /></button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} aria-label={`${pageNumber}페이지`} aria-current={page === pageNumber ? 'page' : undefined} onClick={() => setPage(pageNumber)} className={`flex size-8 items-center justify-center rounded-lg text-[11px] font-semibold transition ${page === pageNumber ? 'bg-[#1d64d8] text-white shadow-sm' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{pageNumber}</button>)}
                <button aria-label="다음 페이지" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowRight size={14} /></button>
              </div>
            </div>
          </section>
          <footer className="mt-5 flex flex-col items-start justify-between gap-2 px-1 text-[10px] text-slate-400 sm:flex-row sm:items-center"><p>© 2026 SOR Console. 스마트 주문 라우팅 운영 시스템</p><p className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" />데이터 동기화 완료 <span className="font-mono">14:32:18</span></p></footer>
        </div>
      </main>
    </div>
  )
}
