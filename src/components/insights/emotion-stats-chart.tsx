"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EmotionStatPoint = {
  count: number;
  emotion: string;
};

type EmotionStatsChartProps = {
  data: EmotionStatPoint[];
};

export function EmotionStatsChart({ data }: EmotionStatsChartProps) {
  return (
    <div className="emotion-stats-chart" aria-label="最近 7 天手动情绪标签统计图表">
      <ResponsiveContainer height={280} width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="emotion"
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            type="category"
            width={54}
          />
          <Tooltip
            cursor={{ fill: "rgb(165 131 115 / 10%)" }}
            formatter={(value) => [`${value} 次`, "出现次数"]}
            labelFormatter={(label) => `${label}`}
          />
          <Bar
            dataKey="count"
            fill="var(--clay)"
            maxBarSize={30}
            name="count"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
