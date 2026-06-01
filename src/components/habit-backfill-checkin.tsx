"use client";

import { useState } from "react";
import { useActionState } from "react";
import { CalendarDays } from "lucide-react";
import { toggleHabitCheckinAction } from "@/app/daily/actions";
import { getBeijingDateValue, getBeijingDateAfter } from "@/lib/date";
import { HabitCheckinCalendar } from "@/components/habit-checkin-calendar";

type CheckinMap = Record<string, "checked" | "skipped">;

export function HabitBackfillCheckin({
  habitId,
  checkinMap,
}: {
  habitId: string;
  checkinMap: CheckinMap;
}) {
  const today = getBeijingDateValue();
  const minDate = getBeijingDateAfter(-29);
  const [selectedDate, setSelectedDate] = useState(today);

  const wrappedAction = async (
    _prevState: { success: boolean; error?: string } | null,
    formData: FormData,
  ) => {
    return toggleHabitCheckinAction(_prevState, formData);
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <section className="panel-card">
      <h2 className="section-heading">补打卡</h2>
      <p className="body-copy mt-2">点击日历选择日期，支持补打最近 30 天内的记录。</p>

      <HabitCheckinCalendar
        checkinMap={checkinMap}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        minDate={minDate}
        maxDate={today}
      />

      <form action={formAction} className="mt-4">
        <input type="hidden" name="habitId" value={habitId} />
        <input type="hidden" name="intent" value="check" />
        <input type="hidden" name="checkinDate" value={selectedDate} />
        <button
          className="soft-button text-sm"
          type="submit"
          disabled={isPending}
        >
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          {isPending ? "保存中..." : "补打卡"}
        </button>
      </form>

      {state?.success && (
        <p className="text-sm text-[var(--sage)] mt-2">补打卡成功！</p>
      )}
      {state?.error === "date_out_of_range" && (
        <p className="text-sm text-[var(--clay)] mt-2">只能补打最近 30 天内的记录。</p>
      )}
      {state?.error && state.error !== "date_out_of_range" && (
        <p className="text-sm text-[var(--clay)] mt-2">打卡失败，请稍后重试。</p>
      )}
    </section>
  );
}
