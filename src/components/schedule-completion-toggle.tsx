"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toggleScheduleCompletionAction } from "@/app/checklist/actions";

export function ScheduleCompletionToggle({
  scheduleId,
  completionDate,
  isCompleted,
  label,
}: {
  scheduleId: string;
  completionDate: string;
  isCompleted: boolean;
  label?: string;
}) {
  const wrappedAction = async (
    _prevState: { success: boolean; error?: string } | null,
    formData: FormData,
  ) => {
    return toggleScheduleCompletionAction(_prevState, formData);
  };
  const [, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <input type="hidden" name="completionDate" value={completionDate} />
      <input type="hidden" name="isCurrentlyCompleted" value={String(isCompleted)} />
      <button
        aria-label={label ?? (isCompleted ? "取消完成" : "完成")}
        className={`quick-check-button ${isCompleted ? "checked" : ""}`}
        disabled={isPending}
        type="submit"
      >
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </form>
  );
}
