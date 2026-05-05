"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RecordTrendPoint = {
  dateValue: string;
  eventCount: number;
  ideaCount: number;
  label: string;
  recordCount: number;
};

type RecordTrendChartProps = {
  data: RecordTrendPoint[];
};

export function RecordTrendChart({ data }: RecordTrendChartProps) {
  return (
    <div className="record-trend-chart" aria-label="最近 7 天随手记录数量趋势图表">
      <ResponsiveContainer height={280} width="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={42}
          />
          <Tooltip
            cursor={{ fill: "rgb(109 143 161 / 10%)" }}
            formatter={(value, name) => {
              const label = name === "eventCount" ? "事件" : "灵感";

              return [`${value} 条`, label];
            }}
            labelFormatter={(label) => `${label}`}
          />
          <Legend
            formatter={(value) => (value === "eventCount" ? "事件" : "灵感")}
            iconType="circle"
            wrapperStyle={{ color: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Bar
            dataKey="eventCount"
            fill="var(--clay)"
            maxBarSize={42}
            name="eventCount"
            radius={[0, 0, 4, 4]}
            stackId="records"
          />
          <Bar
            dataKey="ideaCount"
            fill="var(--mist)"
            maxBarSize={42}
            name="ideaCount"
            radius={[6, 6, 0, 0]}
            stackId="records"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
