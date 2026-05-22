"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  permanentlyDeleteTrashedItemForUser,
  restoreTrashedItemForUser,
} from "@/lib/data/user-data";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function restoreTrashItemAction(formData: FormData) {
  const user = await requireCurrentUser("/trash");
  const id = getStringValue(formData, "id");
  const kind = getStringValue(formData, "kind");

  if (!id || !kind) {
    redirect("/trash?error=invalid_input");
  }

  try {
    await restoreTrashedItemForUser({ userId: user.id, kind, id });
    revalidatePath("/trash");
    redirect("/trash?restored=1");
  } catch {
    redirect("/trash?error=save_failed");
  }
}

export async function permanentlyDeleteTrashItemAction(formData: FormData) {
  const user = await requireCurrentUser("/trash");
  const id = getStringValue(formData, "id");
  const kind = getStringValue(formData, "kind");

  if (!id || !kind) {
    redirect("/trash?error=invalid_input");
  }

  try {
    await permanentlyDeleteTrashedItemForUser({ userId: user.id, kind, id });
    revalidatePath("/trash");
    redirect("/trash?deleted=1");
  } catch {
    redirect("/trash?error=save_failed");
  }
}
