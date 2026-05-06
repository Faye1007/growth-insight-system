"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  buildDailyReviewContext,
  buildDailyReviewInputWithSelectedOriginals,
  type DailyReviewContext,
} from "@/lib/ai/daily-review-context";
import { AiConfigurationError, generateReview } from "@/lib/ai/provider";
import type { GenerateReviewOutput } from "@/lib/ai/types";
import {
  createHabitForUser,
  createIdeaForUser,
  createLifeEventForUser,
  createScheduleItemForUser,
  createTaskForUser,
  getActiveHabitIdForUser,
  getCompletedDailyReviewReportIdForUser,
  getTaskDateForUser,
  postponeTaskForUser,
  softDeleteTaskForUser,
  updateTaskStatusForUser,
  updateTaskForUser,
  upsertDailyReviewReportForUser,
  upsertHabitCheckinForUser,
} from "@/lib/data/user-data";
import { isTaskCategory, isTaskStatus } from "@/lib/tasks/options";

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

function getBeijingDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function getValidTaskDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : getBeijingDateValue();
}

function isValidDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeValue(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function getTagsValue(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function isAiAnalysisPermission(
  value: string,
): value is "none" | "summary_only" | "allow_original" {
  return value === "none" || value === "summary_only" || value === "allow_original";
}

export async function createTaskAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const title = getStringValue(formData, "title");

  if (!title) {
    redirect("/daily?taskError=missing_title#tasks");
  }

  const categoryValue = getStringValue(formData, "category");
  const statusValue = getStringValue(formData, "status");
  const taskDate = getValidTaskDate(getStringValue(formData, "taskDate"));
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const status = isTaskStatus(statusValue) ? statusValue : "todo";

  try {
    await createTaskForUser({
      userId: user.id,
      title,
      category,
      status,
      taskDate,
      completedAt: status === "completed" ? new Date() : null,
    });
  } catch {
    redirect("/daily?taskError=save_failed#tasks");
  }

  revalidatePath("/daily");
  redirect("/daily?taskCreated=1#tasks");
}

export async function updateTaskStatusAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const taskId = getStringValue(formData, "taskId");
  const statusValue = getStringValue(formData, "status");

  if (!taskId || !isTaskStatus(statusValue)) {
    redirect("/daily?taskError=invalid_status#tasks");
  }

  let existingTask: { taskDate: string } | undefined;

  try {
    existingTask = (await getTaskDateForUser(user.id, taskId)) ?? undefined;
  } catch {
    redirect("/daily?taskError=save_failed#tasks");
  }

  if (!existingTask) {
    redirect("/daily?taskError=missing_task#tasks");
  }

  const now = new Date();

  if (statusValue === "postponed") {
    const postponedToDate = getStringValue(formData, "postponedToDate");

    if (!isValidDateValue(postponedToDate)) {
      redirect("/daily?taskError=missing_postponed_date#tasks");
    }

    try {
      await postponeTaskForUser({
        userId: user.id,
        taskId,
        postponedFromDate: existingTask.taskDate,
        postponedToDate,
        updatedAt: now,
      });
    } catch {
      redirect("/daily?taskError=save_failed#tasks");
    }

    revalidatePath("/daily");
    redirect("/daily?taskUpdated=postponed#tasks");
  }

  try {
    await updateTaskStatusForUser({
      userId: user.id,
      taskId,
      status: statusValue,
      completedAt: statusValue === "completed" ? now : null,
      updatedAt: now,
    });
  } catch {
    redirect("/daily?taskError=save_failed#tasks");
  }

  revalidatePath("/daily");
  redirect(`/daily?taskUpdated=${statusValue}#tasks`);
}

export async function updateTaskAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const taskId = getStringValue(formData, "taskId");
  const title = getStringValue(formData, "title");
  const source = getStringValue(formData, "source");
  const errorPath =
    source === "detail" && taskId ? `/records/task/${taskId}?taskError=save_failed` : "/daily?taskError=save_failed#tasks";

  if (!taskId) {
    redirect("/daily?taskError=missing_task#tasks");
  }

  if (!title) {
    redirect(source === "detail" ? `/records/task/${taskId}?taskError=missing_title` : "/daily?taskError=missing_title#tasks");
  }

  const categoryValue = getStringValue(formData, "category");
  const statusValue = getStringValue(formData, "status");
  const taskDateValue = getStringValue(formData, "taskDate");
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const status = isTaskStatus(statusValue) ? statusValue : "todo";
  const taskDate = isValidDateValue(taskDateValue) ? taskDateValue : getBeijingDateValue();
  const description = getStringValue(formData, "description") || null;
  const reviewNote = getStringValue(formData, "reviewNote") || null;
  const updatedAt = new Date();

  try {
    await updateTaskForUser({
      userId: user.id,
      taskId,
      title,
      description,
      category,
      status,
      taskDate,
      reviewNote,
      completedAt: status === "completed" ? updatedAt : null,
      updatedAt,
    });
  } catch {
    redirect(errorPath);
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(`/records/task/${taskId}`);

  if (source === "detail") {
    redirect(`/records/task/${taskId}?taskUpdated=edited`);
  }

  redirect("/daily?taskUpdated=edited#tasks");
}

export async function softDeleteTaskAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const taskId = getStringValue(formData, "taskId");
  const source = getStringValue(formData, "source");

  if (!taskId) {
    redirect("/daily?taskError=missing_task#tasks");
  }

  try {
    await softDeleteTaskForUser({
      userId: user.id,
      taskId,
      deletedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `/records/task/${taskId}?taskError=save_failed`
        : "/daily?taskError=save_failed#tasks",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(`/records/task/${taskId}`);

  if (source === "detail") {
    redirect("/records?taskDeleted=1");
  }

  redirect("/daily?taskUpdated=deleted#tasks");
}

export async function createHabitAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const name = getStringValue(formData, "name");

  if (!name) {
    redirect("/daily?habitError=missing_name#habits");
  }

  const categoryValue = getStringValue(formData, "category");
  const startDateValue = getStringValue(formData, "startDate");
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const startDate = isValidDateValue(startDateValue) ? startDateValue : getBeijingDateValue();

  try {
    await createHabitForUser({
      userId: user.id,
      name,
      category,
      startDate,
    });
  } catch {
    redirect("/daily?habitError=save_failed#habits");
  }

  revalidatePath("/daily");
  redirect("/daily?habitCreated=1#habits");
}

export async function updateHabitCheckinAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const habitId = getStringValue(formData, "habitId");
  const intent = getStringValue(formData, "intent");
  const todayDate = getBeijingDateValue();

  if (!habitId || (intent !== "check" && intent !== "cancel")) {
    redirect("/daily?habitError=invalid_checkin#habits");
  }

  let existingHabit: { id: string } | undefined;

  try {
    existingHabit = (await getActiveHabitIdForUser(user.id, habitId)) ?? undefined;
  } catch {
    redirect("/daily?habitError=save_failed#habits");
  }

  if (!existingHabit) {
    redirect("/daily?habitError=missing_habit#habits");
  }

  const status = intent === "check" ? "checked" : "skipped";

  try {
    await upsertHabitCheckinForUser({
      userId: user.id,
      habitId,
      checkinDate: todayDate,
      status,
      updatedAt: new Date(),
    });
  } catch {
    redirect("/daily?habitError=save_failed#habits");
  }

  revalidatePath("/daily");
  redirect(`/daily?habitUpdated=${status}#habits`);
}

export async function createScheduleItemAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const title = getStringValue(formData, "title");

  if (!title) {
    redirect("/daily?scheduleError=missing_title#schedule");
  }

  const categoryValue = getStringValue(formData, "category");
  const scheduleDateValue = getStringValue(formData, "scheduleDate");
  const startTimeValue = getStringValue(formData, "startTime");
  const endTimeValue = getStringValue(formData, "endTime");
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const scheduleDate = isValidDateValue(scheduleDateValue) ? scheduleDateValue : getBeijingDateValue();

  if (!isValidTimeValue(startTimeValue)) {
    redirect("/daily?scheduleError=missing_time#schedule");
  }

  if (endTimeValue && !isValidTimeValue(endTimeValue)) {
    redirect("/daily?scheduleError=invalid_time#schedule");
  }

  try {
    await createScheduleItemForUser({
      userId: user.id,
      title,
      category,
      scheduleDate,
      startTime: startTimeValue,
      endTime: endTimeValue || null,
    });
  } catch {
    redirect("/daily?scheduleError=save_failed#schedule");
  }

  revalidatePath("/daily");
  redirect("/daily?scheduleCreated=1#schedule");
}

export async function createQuickRecordAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const recordType = getStringValue(formData, "recordType");
  const content = getStringValue(formData, "content");

  if (!content) {
    redirect("/daily?recordError=missing_content#notes");
  }

  const dateValue = getStringValue(formData, "recordDate");
  const recordDate = isValidDateValue(dateValue) ? dateValue : getBeijingDateValue();

  if (recordType === "event") {
    const aiPermissionValue = getStringValue(formData, "aiAnalysisPermission");
    const aiAnalysisPermission = isAiAnalysisPermission(aiPermissionValue)
      ? aiPermissionValue
      : "summary_only";

    try {
      await createLifeEventForUser({
        userId: user.id,
        eventDate: recordDate,
        content,
        emotionTags: getStringValues(formData, "emotionTags"),
        tags: getTagsValue(getStringValue(formData, "tags")),
        aiAnalysisPermission,
      });
    } catch {
      redirect("/daily?recordError=save_failed#notes");
    }

    revalidatePath("/daily");
    redirect("/daily?recordCreated=event#notes");
  }

  if (recordType === "idea") {
    try {
      await createIdeaForUser({
        userId: user.id,
        ideaDate: recordDate,
        content,
      });
    } catch {
      redirect("/daily?recordError=save_failed#notes");
    }

    revalidatePath("/daily");
    redirect("/daily?recordCreated=idea#notes");
  }

  redirect("/daily?recordError=invalid_type#notes");
}

export async function generateDailyReviewAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const todayDate = getBeijingDateValue();
  let existingReport: { id: string } | undefined;

  try {
    existingReport =
      (await getCompletedDailyReviewReportIdForUser(user.id, todayDate)) ?? undefined;
  } catch {
    redirect("/daily?reviewError=context_failed#daily-review-entry");
  }

  if (existingReport) {
    redirect("/daily?reviewCached=1#daily-review-report");
  }

  let context: DailyReviewContext;

  try {
    context = await buildDailyReviewContext(user.id, todayDate);
  } catch {
    redirect("/daily?reviewError=context_failed#daily-review-entry");
  }
  const selectedOriginalEventIds = getStringValues(formData, "originalEventId");
  const reviewInput = buildDailyReviewInputWithSelectedOriginals(
    context,
    selectedOriginalEventIds,
  );

  let output: GenerateReviewOutput;

  try {
    output = await generateReview(reviewInput);
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      redirect("/daily?reviewError=missing_ai_config#daily-review-entry");
    }

    redirect("/daily?reviewError=provider_failed#daily-review-entry");
  }

  const now = new Date();

  try {
    await upsertDailyReviewReportForUser({
      userId: user.id,
      date: todayDate,
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
    redirect("/daily?reviewError=save_failed#daily-review-entry");
  }

  revalidatePath("/daily");
  redirect("/daily?reviewGenerated=1#daily-review-report");
}
