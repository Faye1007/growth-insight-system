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

type HabitCheckinPoint = {
  checked: boolean;
  dateValue: string;
  label: string;
};

type HabitCheckinRow = {
  categoryLabel: string;
  checkins: HabitCheckinPoint[];
  id: string;
  name: string;
  recentCheckedCount: number;
  streakCount: number;
};

type HabitCheckinChartProps = {
  data: HabitCheckinRow[];
};

export function HabitCheckinChart({ data }: HabitCheckinChartProps) {
  const weekLabels = data[0]?.checkins.map((checkin) => checkin.label) ?? [];

  return (
    <div className="habit-checkin-chart" aria-label="最近 7 天习惯打卡图表">
      <ResponsiveContainer height={240} width="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            domain={[0, 7]}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={42}
          />
          <Tooltip
            cursor={{ fill: "rgb(120 146 125 / 10%)" }}
            formatter={(value, name, point) => {
              const payload = point.payload as HabitCheckinRow;

              if (name === "recentCheckedCount") {
                return [`${value}/7 天，连续 ${payload.streakCount} 天`, "最近 7 天"];
              }

              return [value, name];
            }}
            labelFormatter={(label) => `${label}`}
          />
          <Bar
            dataKey="recentCheckedCount"
            fill="var(--sage)"
            maxBarSize={42}
            name="recentCheckedCount"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="habit-checkin-matrix" aria-label="最近 7 天习惯打卡明细">
        <div className="habit-checkin-header">
          <span />
          {weekLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {data.map((habit) => (
          <div key={habit.id} className="habit-checkin-row">
            <span className="habit-checkin-name">{habit.name}</span>
            {habit.checkins.map((checkin) => (
              <span
                key={checkin.dateValue}
                aria-label={`${checkin.label} ${checkin.checked ? "已打卡" : "未打卡"}`}
                className={checkin.checked ? "habit-checkin-dot checked" : "habit-checkin-dot"}
                title={`${checkin.label} ${checkin.checked ? "已打卡" : "未打卡"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
