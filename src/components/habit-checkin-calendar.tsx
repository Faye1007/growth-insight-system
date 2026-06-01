"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBeijingDateValue } from "@/lib/date";

type CheckinMap = Record<string, "checked" | "skipped">;

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun, 1=Mon, ...

  const days: Array<{ date: string; dayNum: number; isCurrentMonth: boolean }> = [];
  const today = getBeijingDateValue();

  // 填充上月日期
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, dayNum: d.getDate(), isCurrentMonth: false });
  }

  // 当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, dayNum: i, isCurrentMonth: true });
  }

  // 填充下月日期
  const remaining = 42 - days.length; // 6 行
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, dayNum: d.getDate(), isCurrentMonth: false });
  }

  return { days, today };
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+08:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdays[d.getDay()];
  return `${month}月${day}日 周${weekday}`;
}

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export function HabitCheckinCalendar({
  checkinMap,
  onSelectDate,
  selectedDate,
  minDate,
  maxDate,
}: {
  checkinMap: CheckinMap;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  minDate: string;
  maxDate: string;
}) {
  const today = getBeijingDateValue();
  const [currentYear, setCurrentYear] = useState(() => parseInt(today.slice(0, 4)));
  const [currentMonth, setCurrentMonth] = useState(() => parseInt(today.slice(5, 7)) - 1);

  const { days } = getMonthDays(currentYear, currentMonth);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  const monthLabel = `${currentYear}年${currentMonth + 1}月`;

  return (
    <div className="habit-calendar">
      <div className="habit-calendar-header">
        <button type="button" className="quiet-button text-sm" onClick={prevMonth}>
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold">{monthLabel}</span>
        <button type="button" className="quiet-button text-sm" onClick={nextMonth}>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="habit-calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="habit-calendar-weekday">{label}</span>
        ))}
      </div>

      <div className="habit-calendar-grid">
        {days.map((day) => {
          const isInRange = day.date >= minDate && day.date <= maxDate;
          const isToday = day.date === today;
          const isSelected = day.date === selectedDate;
          const checkinStatus = checkinMap[day.date];

          return (
            <button
              key={day.date}
              type="button"
              className={`habit-calendar-day
                ${!day.isCurrentMonth ? "other-month" : ""}
                ${!isInRange ? "out-of-range" : ""}
                ${isToday ? "is-today" : ""}
                ${isSelected ? "is-selected" : ""}
                ${checkinStatus === "checked" ? "is-checked" : ""}
                ${checkinStatus === "skipped" ? "is-skipped" : ""}
              `}
              disabled={!isInRange}
              onClick={() => isInRange && onSelectDate(day.date)}
            >
              <span className="habit-calendar-day-num">{day.dayNum}</span>
              {checkinStatus === "checked" && (
                <span className="habit-calendar-dot checked-dot" />
              )}
              {checkinStatus === "skipped" && (
                <span className="habit-calendar-dot skipped-dot" />
              )}
            </button>
          );
        })}
      </div>

      <div className="habit-calendar-legend">
        <span className="habit-calendar-legend-item">
          <span className="habit-calendar-dot checked-dot" /> 已打卡
        </span>
        <span className="habit-calendar-legend-item">
          <span className="habit-calendar-dot skipped-dot" /> 已取消
        </span>
        <span className="habit-calendar-legend-item">
          <span className="habit-calendar-day-num-legend" /> 可选日期
        </span>
      </div>

      {selectedDate && (
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          已选择：{formatDateDisplay(selectedDate)}
        </p>
      )}
    </div>
  );
}
