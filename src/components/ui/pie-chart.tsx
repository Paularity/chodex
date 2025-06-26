import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export interface PieSlice {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieSlice[];
  className?: string;
}

export function SimplePieChart({ data, className }: PieChartProps) {
  const fallbackColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius="80%">
            {data.map((entry, index) => (
              <Cell
                key={`slice-${index}`}
                fill={entry.color || fallbackColors[index % fallbackColors.length]}
              />
            ))}
          </Pie>
          <Tooltip wrapperClassName="text-xs" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
