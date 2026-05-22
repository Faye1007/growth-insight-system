"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteRecordItemAction } from "@/app/daily/actions";

export function DeleteButton({
  id,
  kind,
  label = "删除",
}: {
  id: string;
  kind: "schedule" | "event" | "idea" | "habit";
  label?: string;
}) {
  const wrappedAction = async (
    _prevState: { success: boolean; error?: string } | null,
    formData: FormData,
  ) => {
    return deleteRecordItemAction(_prevState, formData);
  };
  const [, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <button className="quiet-button danger-button" disabled={isPending} type="submit">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}
