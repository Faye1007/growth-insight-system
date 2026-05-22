"use client";

import { useActionState } from "react";
import { Pin } from "lucide-react";
import { togglePinnedAction } from "@/app/daily/actions";

export function PinToggle({
  id,
  isPinned,
  kind,
}: {
  id: string;
  isPinned: boolean;
  kind: "task" | "habit" | "schedule" | "event" | "idea";
}) {
  const wrappedAction = async (
    _prevState: { success: boolean; error?: string } | null,
    formData: FormData,
  ) => {
    return togglePinnedAction(_prevState, formData);
  };
  const [, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="isPinned" value={String(!isPinned)} />
      <button className="quiet-button" disabled={isPending} type="submit">
        <Pin aria-hidden="true" className="h-4 w-4" />
        {isPinned ? "取消置顶" : "置顶"}
      </button>
    </form>
  );
}
