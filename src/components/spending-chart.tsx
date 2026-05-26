'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/types'
import {
  type ExchangeRates,
  type NbrbRate,
  convertToBynWithLookup,
  formatMoney,
} from '@/lib/currency'

interface SpendingChartProps {
  transactions: Transaction[]
  ratesLookup: Record<string, NbrbRate>
  todayRates: ExchangeRates
}

const INCOME_COLOR = '#10b981'
const EXPENSE_COLOR = '#f43f5e'

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}) {
  if (!active || !payload?.length) return null
  const { name, value, payload: item } = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <span style={{ color: item.color }} className="font-medium">
        {name}
      </span>
      <span className="ml-2 font-semibold">{formatMoney(value, 'BYN')}</span>
    </div>
  )
}

export default function SpendingChart({
  transactions,
  ratesLookup,
  todayRates,
}: SpendingChartProps) {
  const { income, expenses, data } = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const toByn = (t: Transaction) =>
      convertToBynWithLookup(
        t.amount,
        t.currency ?? 'BYN',
        t.date,
        ratesLookup,
        todayRates
      )

    const monthly = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year
    })

    const income = monthly
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + toByn(t), 0)

    const expenses = monthly
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + toByn(t), 0)

    const data = [
      { name: 'Доходы', value: income, color: INCOME_COLOR },
      { name: 'Расходы', value: expenses, color: EXPENSE_COLOR },
    ].filter((d) => d.value > 0)

    return { income, expenses, data }
  }, [transactions, ratesLookup, todayRates])

  const hasData = income > 0 || expenses > 0

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Доходы и расходы за месяц (BYN)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Нет данных за текущий месяц
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-64 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={data.length > 1 ? 3 : 0}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-3 text-sm w-full">
              {income > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ background: INCOME_COLOR }}
                    />
                    <span className="text-muted-foreground">Доходы</span>
                  </div>
                  <span className="font-semibold text-emerald-600 tabular-nums">
                    {formatMoney(income, 'BYN')}
                  </span>
                </div>
              )}
              {expenses > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ background: EXPENSE_COLOR }}
                    />
                    <span className="text-muted-foreground">Расходы</span>
                  </div>
                  <span className="font-semibold text-rose-600 tabular-nums">
                    {formatMoney(expenses, 'BYN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
