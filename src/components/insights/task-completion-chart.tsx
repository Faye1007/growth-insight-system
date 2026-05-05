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

type TaskCompletionPoint = {
  dateValue: string;
  label: string;
  completedTaskCount: number;
  taskCompletionRate: number;
  taskCount: number;
};

type TaskCompletionChartProps = {
  data: TaskCompletionPoint[];
};

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  return (
    <div className="task-completion-chart" aria-label="最近 7 天任务完成率图表">
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={54}
          />
          <Tooltip
            cursor={{ fill: "rgb(141 128 170 / 10%)" }}
            formatter={(value, name, point) => {
              if (name === "taskCompletionRate") {
                const payload = point.payload as TaskCompletionPoint;
                return [`${value}% (${payload.completedTaskCount}/${payload.taskCount})`, "完成率"];
              }

              return [value, name];
            }}
            labelFormatter={(label) => `${label}`}
          />
          <Bar
            dataKey="taskCompletionRate"
            fill="var(--lavender)"
            maxBarSize={42}
            name="taskCompletionRate"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
