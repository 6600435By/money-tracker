'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/types'

interface SpendingChartProps {
  transactions: Transaction[]
}

const INCOME_COLOR = '#10b981'  // emerald-500
const EXPENSE_COLOR = '#f43f5e' // rose-500

const formatRub = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

interface TooltipPayload {
  name: string
  value: number
  payload: { color: string }
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) return null
  const { name, value, payload: item } = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <span style={{ color: item.color }} className="font-medium">
        {name}
      </span>
      <span className="ml-2 text-foreground font-semibold">{formatRub(value)}</span>
    </div>
  )
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  const { income, expenses, data } = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const monthly = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year
    })

    const income = monthly
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)

    const expenses = monthly
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)

    const data = [
      { name: 'Доходы', value: income, color: INCOME_COLOR },
      { name: 'Расходы', value: expenses, color: EXPENSE_COLOR },
    ].filter((d) => d.value > 0)

    return { income, expenses, data }
  }, [transactions])

  const hasData = income > 0 || expenses > 0

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Доходы и расходы за месяц</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Нет данных за текущий месяц
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Pie chart */}
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

            {/* Legend */}
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
                  <span className="font-semibold text-emerald-600 text-balance-display tabular-nums">
                    {formatRub(income)}
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
                  <span className="font-semibold text-rose-600 text-balance-display tabular-nums">
                    {formatRub(expenses)}
                  </span>
                </div>
              )}
              {income > 0 && expenses > 0 && (
                <>
                  <div className="border-t border-border my-1" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Баланс</span>
                    <span
                      className={`font-semibold text-balance-display tabular-nums ${
                        income - expenses >= 0 ? 'text-primary' : 'text-rose-600'
                      }`}
                    >
                      {income - expenses >= 0 ? '+' : ''}
                      {formatRub(income - expenses)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Расходы от доходов</span>
                      <span>{Math.round((expenses / income) * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${Math.min((expenses / income) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
