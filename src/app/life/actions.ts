"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";
import {
  createAnniversaryForUser,
  createGiftRecordForUser,
  softDeleteAnniversaryForUser,
  softDeleteGiftRecordForUser,
  updateAnniversaryForUser,
  updateGiftRecordForUser,
} from "@/lib/data/user-data";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(value: string) {
  return value || null;
}

function isValidDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getAnniversaryInput(formData: FormData) {
  const title = getStringValue(formData, "title");
  const personName = getStringValue(formData, "personName");
  const type = (getStringValue(formData, "type") || "anniversary") as "anniversary" | "birthday";
  const anniversaryDate = getStringValue(formData, "anniversaryDate");
  const isLunar = formData.get("isLunar") === "on";
  const reminderDate = getStringValue(formData, "reminderDate");
  const reminderMode = (getStringValue(formData, "reminderMode") || "once") as "once" | "yearly";
  const note = getStringValue(formData, "note");

  if (!title || !personName || !isValidDateValue(anniversaryDate)) {
    return null;
  }

  if (reminderDate && !isValidDateValue(reminderDate)) {
    return null;
  }

  return {
    title,
    personName,
    type,
    anniversaryDate,
    isLunar,
    reminderDate: getNullableString(reminderDate),
    reminderMode,
    note: getNullableString(note),
  };
}

function getGiftRecordInput(formData: FormData) {
  const giftName = getStringValue(formData, "giftName");
  const recipientName = getStringValue(formData, "recipientName");
  const giftDate = getStringValue(formData, "giftDate");
  const returnGift = getStringValue(formData, "returnGift");
  const anniversaryId = getStringValue(formData, "anniversaryId");
  const note = getStringValue(formData, "note");

  if (!giftName || !recipientName || !isValidDateValue(giftDate)) {
    return null;
  }

  return {
    giftName,
    recipientName,
    giftDate,
    returnGift: getNullableString(returnGift),
    anniversaryId: getNullableString(anniversaryId),
    note: getNullableString(note),
  };
}

export async function createAnniversaryAction(formData: FormData) {
  const user = await requireCurrentUser("/life");
  const input = getAnniversaryInput(formData);

  if (!input) {
    redirect("/life?tab=anniversaries&anniversaryError=invalid_input#anniversaries");
  }

  try {
    await createAnniversaryForUser({
      userId: user.id,
      ...input,
    });
  } catch {
    redirect("/life?tab=anniversaries&anniversaryError=save_failed#anniversaries");
  }

  revalidatePath("/life");
  redirect("/life?tab=anniversaries&anniversarySaved=created#anniversaries");
}

export async function updateAnniversaryAction(formData: FormData) {
  const user = await requireCurrentUser("/life");
  const anniversaryId = getStringValue(formData, "anniversaryId");
  const input = getAnniversaryInput(formData);
  const source = getStringValue(formData, "source");
  const detailPath = anniversaryId ? `/life/anniversary/${anniversaryId}` : "/life";

  if (!anniversaryId || !input) {
    redirect(
      source === "detail"
        ? `${detailPath}?anniversaryError=invalid_input`
        : "/life?tab=anniversaries&anniversaryError=invalid_input#anniversaries",
    );
  }

  try {
    await updateAnniversaryForUser({
      userId: user.id,
      anniversaryId,
      updatedAt: new Date(),
      ...input,
    });
  } catch {
    redirect(
      source === "detail"
        ? `${detailPath}?anniversaryError=save_failed`
        : "/life?tab=anniversaries&anniversaryError=save_failed#anniversaries",
    );
  }

  revalidatePath("/life");
  revalidatePath(detailPath);
  redirect(
    source === "detail"
      ? `${detailPath}?anniversarySaved=updated`
      : "/life?tab=anniversaries&anniversarySaved=updated#anniversaries",
  );
}

export async function softDeleteAnniversaryAction(formData: FormData) {
  const user = await requireCurrentUser("/life");
  const anniversaryId = getStringValue(formData, "anniversaryId");
  const source = getStringValue(formData, "source");
  const detailPath = anniversaryId ? `/life/anniversary/${anniversaryId}` : "/life";

  if (!anniversaryId) {
    redirect(
      source === "detail"
        ? "/life?tab=anniversaries&anniversaryError=missing_anniversary#anniversaries"
        : "/life?tab=anniversaries&anniversaryError=missing_anniversary#anniversaries",
    );
  }

  try {
    await softDeleteAnniversaryForUser({
      userId: user.id,
      anniversaryId,
      deletedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${detailPath}?anniversaryError=save_failed`
        : "/life?tab=anniversaries&anniversaryError=save_failed#anniversaries",
    );
  }

  revalidatePath("/life");
  revalidatePath(detailPath);
  redirect("/life?tab=anniversaries&anniversarySaved=deleted#anniversaries");
}

export async function createGiftRecordAction(formData: FormData) {
  const user = await requireCurrentUser("/life");
  const input = getGiftRecordInput(formData);

  if (!input) {
    redirect("/life?tab=gifts&giftError=invalid_input#gifts");
  }

  try {
    await createGiftRecordForUser({
      userId: user.id,
      ...input,
    });
  } catch {
    redirect("/life?tab=gifts&giftError=save_failed#gifts");
  }

  revalidatePath("/life");
  redirect("/life?tab=gifts&giftSaved=created#gifts");
}

export async function updateGiftRecordAction(formData: FormData) {
  const user = await requireCurrentUser("/life");
  const giftRecordId = getStringValue(formData, "giftRecordId");
  const input = getGiftRecordInput(formData);
  const source = getStringValue(formData, "source");
  const detailPath = giftRecordId ? `/life/gift/${giftRecordId}` : "/life";

  if (!giftRecordId || !input) {
    redirect(
      source === "detail"
        ? `${detailPath}?giftError=invalid_input`
        : "/life?tab=gifts&giftError=invalid_input#gifts",
    );
  }

  try {
    await updateGiftRecordForUser({
      userId: user.id,
      giftRecordId,
      updatedAt: new Date(),
      ...input,
    });
  } catch {
    redirect(
      source === "detail"
        ? `${detailPath}?giftError=save_failed`
        : "/life?tab=gifts&giftError=save_failed#gifts",
    );
  }

  revalidatePath("/life");
  revalidatePath(detailPath);
  redirect(
    source === "detail"
      ? `${detailPath}?giftSaved=updated`
      : "/life?tab=gifts&giftSaved=updated#gifts",
  );
}

export async function softDeleteGiftRecordAction(formData: FormData) {
  const user = await requireCurrentUser("/life");
  const giftRecordId = getStringValue(formData, "giftRecordId");
  const source = getStringValue(formData, "source");
  const detailPath = giftRecordId ? `/life/gift/${giftRecordId}` : "/life";

  if (!giftRecordId) {
    redirect("/life?tab=gifts&giftError=missing_gift#gifts");
  }

  try {
    await softDeleteGiftRecordForUser({
      userId: user.id,
      giftRecordId,
      deletedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${detailPath}?giftError=save_failed`
        : "/life?tab=gifts&giftError=save_failed#gifts",
    );
  }

  revalidatePath("/life");
  revalidatePath(detailPath);
  redirect("/life?tab=gifts&giftSaved=deleted#gifts");
}
