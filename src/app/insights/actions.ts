"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  buildWeeklyReviewContext,
  buildWeeklyReviewInputWithSelectedOriginals,
  type WeeklyReviewContext,
} from "@/lib/ai/weekly-review-context";
import { AiConfigurationError, generateReview } from "@/lib/ai/provider";
import type { GenerateReviewOutput } from "@/lib/ai/types";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  getCompletedWeeklyReviewReportIdForUser,
  upsertWeeklyReviewReportForUser,
} from "@/lib/data/user-data";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getStringValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isValidDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function generateWeeklyReviewAction(formData: FormData) {
  const user = await requireCurrentUser("/insights");
  const weekStart = getStringValue(formData, "weekStart");
  const weekEnd = getStringValue(formData, "weekEnd");

  if (!isValidDateValue(weekStart) || !isValidDateValue(weekEnd)) {
    redirect("/insights?weeklyReviewError=context_failed#weekly-review-preview");
  }

  let existingReport: { id: string } | undefined;

  try {
    existingReport =
      (await getCompletedWeeklyReviewReportIdForUser(user.id, weekStart, weekEnd)) ?? undefined;
  } catch {
    redirect("/insights?weeklyReviewError=context_failed#weekly-review-preview");
  }

  if (existingReport) {
    redirect("/insights?weeklyReviewCached=1#weekly-review-report");
  }

  let context: WeeklyReviewContext;

  try {
    context = await buildWeeklyReviewContext(user.id, {
      start: weekStart,
      end: weekEnd,
    });
  } catch {
    redirect("/insights?weeklyReviewError=context_failed#weekly-review-preview");
  }

  const selectedOriginalEventIds = getStringValues(formData, "weeklyOriginalEventId");
  const reviewInput = buildWeeklyReviewInputWithSelectedOriginals(
    context,
    selectedOriginalEventIds,
  );

  let output: GenerateReviewOutput;

  try {
    output = await generateReview(reviewInput);
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      redirect("/insights?weeklyReviewError=missing_ai_config#weekly-review-preview");
    }

    redirect("/insights?weeklyReviewError=provider_failed#weekly-review-preview");
  }

  const now = new Date();

  try {
    await upsertWeeklyReviewReportForUser({
      userId: user.id,
      weekStart,
      weekEnd,
      title: output.title,
      summary: output.summary,
      patterns: output.patterns,
      suggestions: output.suggestions,
      nextActions: output.nextActions,
      sourceStats: reviewInput.stats,
      sourceHighlights: reviewInput.highlights,
      selectedOriginalEventIds: reviewInput.selectedOriginals?.map((item) => item.eventId) ?? [],
      modelProvider: output.modelProvider,
      modelName: output.modelName,
      generatedAt: now,
    });
  } catch {
    redirect("/insights?weeklyReviewError=save_failed#weekly-review-preview");
  }

  revalidatePath("/insights");
  redirect("/insights?weeklyReviewGenerated=1#weekly-review-report");
}
