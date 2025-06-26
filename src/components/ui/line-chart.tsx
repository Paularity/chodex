import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

export interface ChartPoint {
  name: string
  value: number
}

interface LineChartProps {
  data: ChartPoint[]
  className?: string
}

export function SimpleLineChart({ data, className }: LineChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
          <YAxis className="text-xs" tickLine={false} axisLine={false} width={32} />
          <Tooltip wrapperClassName="text-xs" />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
