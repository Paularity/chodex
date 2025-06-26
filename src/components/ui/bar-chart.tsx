import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

export interface ChartPoint {
  name: string
  value: number
}

interface BarChartProps {
  data: ChartPoint[]
  className?: string
}

export function SimpleBarChart({ data, className }: BarChartProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
          <YAxis className="text-xs" tickLine={false} axisLine={false} width={32} />
          <Tooltip wrapperClassName="text-xs" />
          <Bar dataKey="value" fill="var(--chart-2)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
