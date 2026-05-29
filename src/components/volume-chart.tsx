"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  label: string;
  volume: number;
}

interface VolumeChartProps {
  data: ChartDataPoint[];
  title: string;
}

export function VolumeChart({ data, title }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {title}
        </h3>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No data yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="label"
            stroke="#71717a"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={{ stroke: "#71717a" }}
            axisLine={{ stroke: "#27272a" }}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={{ stroke: "#71717a" }}
            axisLine={{ stroke: "#27272a" }}
            tickFormatter={(value: number) =>
              value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : value.toString()
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "0.5rem",
              color: "#fafafa",
              fontSize: "0.875rem",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ color: "#fafafa" }}
            formatter={(value) => [
              `${Number(value).toLocaleString()} kg`,
              "",
            ]}
          />
          <Bar
            dataKey="volume"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
