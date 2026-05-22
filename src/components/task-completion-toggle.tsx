"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toggleTaskCompletionAction } from "@/app/daily/actions";

export function TaskCompletionToggle({
  taskId,
  isCompleted,
  label,
}: {
  taskId: string;
  isCompleted: boolean;
  label?: string;
}) {
  const wrappedAction = async (
    _prevState: { success: boolean; error?: string } | null,
    formData: FormData,
  ) => {
    return toggleTaskCompletionAction(_prevState, formData);
  };
  const [, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="status" value={isCompleted ? "todo" : "completed"} />
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
