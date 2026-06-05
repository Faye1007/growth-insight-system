"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";
import { upsertPersonalManualForUser } from "@/lib/data/user-data/index";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getListValue(value: string) {
  return value
    .split(/\r?\n|[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function getNullableString(value: string) {
  return value || null;
}

export async function savePersonalManualAction(formData: FormData) {
  const user = await requireCurrentUser("/manual");
  const updatedAt = new Date();

  try {
    await upsertPersonalManualForUser({
      userId: user.id,
      lifeStage: getNullableString(getStringValue(formData, "lifeStage")),
      currentGoals: getListValue(getStringValue(formData, "currentGoals")),
      abilityProfile: getNullableString(getStringValue(formData, "abilityProfile")),
      emotionPatterns: getNullableString(getStringValue(formData, "emotionPatterns")),
      energySources: getListValue(getStringValue(formData, "energySources")),
      drainSources: getListValue(getStringValue(formData, "drainSources")),
      recurringProblems: getListValue(getStringValue(formData, "recurringProblems")),
      preferredActionStyle: getNullableString(getStringValue(formData, "preferredActionStyle")),
      updatedAt,
    });
  } catch {
    redirect("/manual?manualError=save_failed");
  }

  revalidatePath("/manual");
  redirect("/manual?manualSaved=1");
}
