"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toggleHabitCheckinAction } from "@/app/daily/actions";

export function HabitCheckinToggle({
  habitId,
  isCheckedToday,
  label,
}: {
  habitId: string;
  isCheckedToday: boolean;
  label?: string;
}) {
  const wrappedAction = async (
    _prevState: { success: boolean; error?: string } | null,
    formData: FormData,
  ) => {
    return toggleHabitCheckinAction(_prevState, formData);
  };
  const [, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="habitId" value={habitId} />
      <input type="hidden" name="intent" value={isCheckedToday ? "cancel" : "check"} />
      <button
        aria-label={label ?? (isCheckedToday ? "取消打卡" : "打卡")}
        className={`quick-check-button ${isCheckedToday ? "checked" : ""}`}
        disabled={isPending}
        type="submit"
      >
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </form>
  );
}
