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
import { getBeijingDateValue } from "@/lib/date";
import {
  createHabitForUser,
  createIdeaForUser,
  createLifeEventForUser,
  createScheduleItemForUser,
  createTaskForUser,
  deactivateHabitForUser,
  getActiveHabitIdForUser,
  getCompletedDailyReviewReportIdForUser,
  getTaskDateForUser,
  postponeTaskForUser,
  softDeleteHabitForUser,
  softDeleteIdeaForUser,
  softDeleteLifeEventForUser,
  softDeleteScheduleItemForUser,
  softDeleteTaskForUser,
  updateHabitPinnedForUser,
  updateIdeaForUser,
  updateIdeaPinnedForUser,
  updateHabitForUser,
  updateLifeEventPinnedForUser,
  updateLifeEventForUser,
  updateSchedulePinnedForUser,
  updateScheduleItemForUser,
  updateTaskPinnedForUser,
  updateTaskStatusForUser,
  updateTaskForUser,
  upsertDailyReviewReportForUser,
  upsertHabitCheckinForUser,
} from "@/lib/data/user-data";
import { isScheduleRecurrence } from "@/lib/schedules/options";
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

function getValidTaskDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : getBeijingDateValue();
}

function isValidDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isDateAfter(value: string, baseline: string) {
  return new Date(`${value}T00:00:00+08:00`).getTime() > new Date(`${baseline}T00:00:00+08:00`).getTime();
}

function isValidTimeValue(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

function normalizeTimeValue(value: string): string {
  const match = value.match(/^([01]\d|2[0-3]):[0-5]\d/);
  return match ? match[0] : value;
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

function isIdeaStatus(
  value: string,
): value is "to_review" | "converted_to_task" | "shelved" | "abandoned" {
  return value === "to_review" || value === "converted_to_task" || value === "shelved" || value === "abandoned";
}

function getPinnedValue(formData: FormData) {
  return getStringValue(formData, "isPinned") === "true";
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
  const source = getStringValue(formData, "source");

  if (!taskId || !isTaskStatus(statusValue)) {
    const redirectPath = source === "checklist" ? "/checklist?tab=tasks" : "/daily?taskError=invalid_status#tasks";
    redirect(redirectPath);
  }

  let existingTask: { taskDate: string } | undefined;

  try {
    existingTask = (await getTaskDateForUser(user.id, taskId)) ?? undefined;
  } catch {
    const redirectPath = source === "checklist" ? "/checklist?tab=tasks" : "/daily?taskError=save_failed#tasks";
    redirect(redirectPath);
  }

  if (!existingTask) {
    const redirectPath = source === "checklist" ? "/checklist?tab=tasks" : "/daily?taskError=missing_task#tasks";
    redirect(redirectPath);
  }

  const now = new Date();

  if (statusValue === "postponed") {
    const postponedToDate = getStringValue(formData, "postponedToDate") || null;

    try {
      await postponeTaskForUser({
        userId: user.id,
        taskId,
        postponedFromDate: existingTask.taskDate,
        postponedToDate,
        updatedAt: now,
      });
    } catch {
      const redirectPath = source === "checklist" ? "/checklist?tab=tasks" : "/daily?taskError=save_failed#tasks";
      redirect(redirectPath);
    }

    revalidatePath("/daily");
    revalidatePath("/checklist");
    redirect(`/checklist?tab=tasks&taskUpdated=postponed`);
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
    const redirectPath = source === "checklist" ? "/checklist?tab=tasks" : "/daily?taskError=save_failed#tasks";
    redirect(redirectPath);
  }

  revalidatePath("/daily");
  revalidatePath("/checklist");

  if (source === "checklist") {
    redirect(`/checklist?tab=tasks&taskUpdated=${statusValue}`);
  }

  redirect(`/daily?taskUpdated=${statusValue}#tasks`);
}

export async function toggleTaskCompletionAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser("/daily");
    const taskId = getStringValue(formData, "taskId");
    const statusValue = getStringValue(formData, "status");

    if (!taskId || !isTaskStatus(statusValue)) {
      return { success: false, error: "invalid_status" };
    }

    const existingTask = await getTaskDateForUser(user.id, taskId);
    if (!existingTask) {
      return { success: false, error: "missing_task" };
    }

    const now = new Date();
    await updateTaskStatusForUser({
      userId: user.id,
      taskId,
      status: statusValue,
      completedAt: statusValue === "completed" ? now : null,
      updatedAt: now,
    });

    revalidatePath("/daily");
    revalidatePath("/checklist");
    return { success: true };
  } catch {
    return { success: false, error: "save_failed" };
  }
}

export async function postponeTaskAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser("/checklist");
    const taskId = getStringValue(formData, "taskId");
    const postponedToDate = getStringValue(formData, "postponedToDate") || null;

    if (!taskId) {
      return { success: false, error: "missing_task" };
    }

    const existingTask = await getTaskDateForUser(user.id, taskId);
    if (!existingTask) {
      return { success: false, error: "missing_task" };
    }

    await postponeTaskForUser({
      userId: user.id,
      taskId,
      postponedFromDate: existingTask.taskDate,
      postponedToDate,
      updatedAt: new Date(),
    });

    revalidatePath("/daily");
    revalidatePath("/checklist");
    return { success: true };
  } catch {
    return { success: false, error: "save_failed" };
  }
}

function isDateWithinDays(dateStr: string, days: number): boolean {
  const today = new Date(getBeijingDateValue() + "T00:00:00+08:00");
  const target = new Date(dateStr + "T00:00:00+08:00");
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays < days;
}

export async function toggleHabitCheckinAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser("/daily");
    const habitId = getStringValue(formData, "habitId");
    const intent = getStringValue(formData, "intent");
    const checkinDateRaw = getStringValue(formData, "checkinDate");

    if (!habitId || (intent !== "check" && intent !== "cancel")) {
      return { success: false, error: "invalid_checkin" };
    }

    const existingHabit = await getActiveHabitIdForUser(user.id, habitId);
    if (!existingHabit) {
      return { success: false, error: "missing_habit" };
    }

    // 补打卡日期校验：只允许最近 30 天内
    const checkinDate = checkinDateRaw || getBeijingDateValue();
    if (checkinDateRaw && !isDateWithinDays(checkinDateRaw, 30)) {
      return { success: false, error: "date_out_of_range" };
    }

    const status = intent === "check" ? "checked" : "skipped";
    await upsertHabitCheckinForUser({
      userId: user.id,
      habitId,
      checkinDate,
      status,
      updatedAt: new Date(),
    });

    revalidatePath("/daily");
    revalidatePath("/checklist");
    revalidatePath(`/checklist/habits/${habitId}`);
    return { success: true };
  } catch {
    return { success: false, error: "save_failed" };
  }
}

export async function deleteRecordItemAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser("/daily");
    const kind = getStringValue(formData, "kind");
    const id = getStringValue(formData, "id");

    if (!id || !kind) {
      return { success: false, error: "missing_id" };
    }

    const deletedAt = new Date();
    const deleter = ({
      schedule: (args: { scheduleId: string }) => softDeleteScheduleItemForUser({ ...args, userId: user.id, deletedAt }),
      event: (args: { eventId: string }) => softDeleteLifeEventForUser({ ...args, userId: user.id, deletedAt }),
      idea: (args: { ideaId: string }) => softDeleteIdeaForUser({ ...args, userId: user.id, deletedAt }),
      habit: (args: { habitId: string }) => softDeleteHabitForUser({ ...args, userId: user.id, deletedAt }),
    })[kind];

    if (!deleter) {
      return { success: false, error: "invalid_kind" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (deleter as any)({ [`${kind === "event" ? "event" : kind}Id`]: id });

    revalidatePath("/daily");
    revalidatePath("/records");
    revalidatePath("/insights");
    return { success: true };
  } catch {
    return { success: false, error: "save_failed" };
  }
}

export async function togglePinnedAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser("/daily");
    const kind = getStringValue(formData, "kind");
    const id = getStringValue(formData, "id");
    const isPinned = getStringValue(formData, "isPinned") === "true";

    if (!id || !kind) {
      return { success: false, error: "missing_id" };
    }

    const updatedAt = new Date();
    const pinner = ({
      task: (args: { taskId: string }) => updateTaskPinnedForUser({ ...args, userId: user.id, isPinned, updatedAt }),
      habit: (args: { habitId: string }) => updateHabitPinnedForUser({ ...args, userId: user.id, isPinned, updatedAt }),
      schedule: (args: { scheduleId: string }) => updateSchedulePinnedForUser({ ...args, userId: user.id, isPinned, updatedAt }),
      event: (args: { eventId: string }) => updateLifeEventPinnedForUser({ ...args, userId: user.id, isPinned, updatedAt }),
      idea: (args: { ideaId: string }) => updateIdeaPinnedForUser({ ...args, userId: user.id, isPinned, updatedAt }),
    })[kind];

    if (!pinner) {
      return { success: false, error: "invalid_kind" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (pinner as any)({ [`${kind}Id`]: id });

    revalidatePath("/daily");
    return { success: true };
  } catch {
    return { success: false, error: "save_failed" };
  }
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

export async function updateTaskPinnedAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const taskId = getStringValue(formData, "taskId");

  if (!taskId) {
    redirect("/daily?taskError=missing_task#tasks");
  }

  try {
    await updateTaskPinnedForUser({
      userId: user.id,
      taskId,
      isPinned: getPinnedValue(formData),
      updatedAt: new Date(),
    });
  } catch {
    redirect("/daily?taskError=save_failed#tasks");
  }

  revalidatePath("/daily");
  redirect("/daily?view=tasks&taskUpdated=pinned#tasks");
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

export async function updateHabitAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const habitId = getStringValue(formData, "habitId");
  const source = getStringValue(formData, "source");
  const recordId = getStringValue(formData, "recordId");
  const name = getStringValue(formData, "name");
  const description = getStringValue(formData, "description");
  const categoryValue = getStringValue(formData, "category");
  const startDateValue = getStringValue(formData, "startDate");
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const startDate = isValidDateValue(startDateValue) ? startDateValue : getBeijingDateValue();

  if (!habitId) {
    redirect(
      source === "detail" && recordId
        ? `/records/habit/${recordId}?habitError=missing_habit`
        : "/daily?habitError=missing_habit#habits",
    );
  }

  if (!name) {
    redirect(
      source === "detail" && recordId
        ? `/records/habit/${recordId}?habitError=missing_name`
        : "/daily?habitError=missing_name#habits",
    );
  }

  try {
    await updateHabitForUser({
      userId: user.id,
      habitId,
      name,
      description: description || null,
      category,
      startDate,
      updatedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail" && recordId
        ? `/records/habit/${recordId}?habitError=save_failed`
        : "/daily?habitError=save_failed#habits",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");

  if (source === "detail" && recordId) {
    revalidatePath(`/records/habit/${recordId}`);
    redirect(`/records/habit/${recordId}?habitUpdated=edited`);
  }

  redirect("/daily?habitUpdated=edited#habits");
}

export async function deactivateHabitAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const habitId = getStringValue(formData, "habitId");
  const source = getStringValue(formData, "source");
  const recordId = getStringValue(formData, "recordId");

  if (!habitId) {
    redirect(
      source === "detail" && recordId
        ? `/records/habit/${recordId}?habitError=missing_habit`
        : source === "checklist"
          ? `/checklist/habits/${habitId}?habitError=missing_habit`
          : "/daily?habitError=missing_habit#habits",
    );
  }

  try {
    await deactivateHabitForUser({
      userId: user.id,
      habitId,
      updatedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail" && recordId
        ? `/records/habit/${recordId}?habitError=save_failed`
        : source === "checklist"
          ? `/checklist/habits/${habitId}?habitError=save_failed`
          : "/daily?habitError=save_failed#habits",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath("/checklist");

  if (source === "detail" && recordId) {
    revalidatePath(`/records/habit/${recordId}`);
    redirect(`/records/habit/${recordId}?habitUpdated=deactivated`);
  }

  if (source === "checklist") {
    redirect(`/checklist/habits/${habitId}?habitUpdated=deactivated`);
  }

  redirect("/daily?habitUpdated=deactivated#habits");
}

export async function softDeleteHabitAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const habitId = getStringValue(formData, "habitId");
  const source = getStringValue(formData, "source");
  const recordId = getStringValue(formData, "recordId");

  if (!habitId) {
    redirect(
      source === "detail" && recordId
        ? `/records/habit/${recordId}?habitError=missing_habit`
        : source === "checklist"
          ? `/checklist/habits/${habitId}?habitError=missing_habit`
          : "/daily?habitError=missing_habit#habits",
    );
  }

  try {
    await softDeleteHabitForUser({
      userId: user.id,
      habitId,
      deletedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail" && recordId
        ? `/records/habit/${recordId}?habitError=save_failed`
        : source === "checklist"
          ? `/checklist/habits/${habitId}?habitError=save_failed`
          : "/daily?habitError=save_failed#habits",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath("/checklist");

  if (source === "detail" && recordId) {
    revalidatePath(`/records/habit/${recordId}`);
    redirect("/records?habitDeleted=1");
  }

  if (source === "checklist") {
    redirect(`/checklist/habits/${habitId}?habitDeleted=1`);
  }

  redirect("/daily?view=habits&habitUpdated=deleted#habits");
}

export async function updateHabitPinnedAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const habitId = getStringValue(formData, "habitId");

  if (!habitId) {
    redirect("/daily?habitError=missing_habit#habits");
  }

  try {
    await updateHabitPinnedForUser({
      userId: user.id,
      habitId,
      isPinned: getPinnedValue(formData),
      updatedAt: new Date(),
    });
  } catch {
    redirect("/daily?habitError=save_failed#habits");
  }

  revalidatePath("/daily");
  redirect("/daily?view=habits&habitUpdated=pinned#habits");
}

export async function updateHabitCheckinAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const habitId = getStringValue(formData, "habitId");
  const intent = getStringValue(formData, "intent");
  const source = getStringValue(formData, "source");
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
  revalidatePath("/checklist");

  if (source === "checklist") {
    redirect(`/checklist?tab=habits&habitUpdated=${status}`);
  }

  redirect(`/daily?habitUpdated=${status}#habits`);
}

export async function createScheduleItemAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const title = getStringValue(formData, "title");

  if (!title) {
    redirect("/daily?scheduleError=missing_title#schedule");
  }

  const categoryValue = getStringValue(formData, "category");
  const startDateValue = getStringValue(formData, "startDate");
  const scheduleDateFallback = getStringValue(formData, "scheduleDate");
  const endDateValue = getStringValue(formData, "endDate");
  const recurrenceValue = getStringValue(formData, "recurrence");
  const startTimeRaw = getStringValue(formData, "startTime");
  const endTimeRaw = getStringValue(formData, "endTime");
  const startTimeValue = normalizeTimeValue(startTimeRaw);
  const endTimeValue = endTimeRaw ? normalizeTimeValue(endTimeRaw) : "";
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const startDate = isValidDateValue(startDateValue) ? startDateValue : (isValidDateValue(scheduleDateFallback) ? scheduleDateFallback : getBeijingDateValue());
  const endDate = isValidDateValue(endDateValue) ? endDateValue : null;
  const recurrence = isScheduleRecurrence(recurrenceValue) ? recurrenceValue : "none";

  if (endDate && isDateAfter(startDate, endDate)) {
    redirect("/daily?scheduleError=invalid_date_range#schedule");
  }

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
      startDate,
      endDate,
      recurrence,
      startTime: startTimeValue,
      endTime: endTimeValue || null,
    });
  } catch {
    redirect("/daily?scheduleError=save_failed#schedule");
  }

  revalidatePath("/daily");
  redirect("/daily?scheduleCreated=1#schedule");
}

export async function updateScheduleItemAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const scheduleId = getStringValue(formData, "scheduleId");
  const title = getStringValue(formData, "title");
  const source = getStringValue(formData, "source");
  const baseDetailPath = scheduleId ? `/records/schedule/${scheduleId}` : "/records";

  if (!scheduleId) {
    redirect("/daily?scheduleError=missing_schedule#schedule");
  }

  if (!title) {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?scheduleError=missing_title`
        : "/daily?scheduleError=missing_title#schedule",
    );
  }

  const categoryValue = getStringValue(formData, "category");
  const startDateValue = getStringValue(formData, "startDate");
  const scheduleDateFallback = getStringValue(formData, "scheduleDate");
  const endDateValue = getStringValue(formData, "endDate");
  const recurrenceValue = getStringValue(formData, "recurrence");
  const startTimeRaw = getStringValue(formData, "startTime");
  const endTimeRaw = getStringValue(formData, "endTime");
  const startTimeValue = normalizeTimeValue(startTimeRaw);
  const endTimeValue = endTimeRaw ? normalizeTimeValue(endTimeRaw) : "";
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const startDate = isValidDateValue(startDateValue) ? startDateValue : (isValidDateValue(scheduleDateFallback) ? scheduleDateFallback : getBeijingDateValue());
  const endDate = isValidDateValue(endDateValue) ? endDateValue : null;
  const recurrence = isScheduleRecurrence(recurrenceValue) ? recurrenceValue : "none";
  const description = getStringValue(formData, "description") || null;

  if (endDate && isDateAfter(startDate, endDate)) {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?scheduleError=invalid_date_range`
        : "/daily?scheduleError=invalid_date_range#schedule",
    );
  }

  if (!isValidTimeValue(startTimeValue)) {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?scheduleError=missing_time`
        : "/daily?scheduleError=missing_time#schedule",
    );
  }

  if (endTimeValue && !isValidTimeValue(endTimeValue)) {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?scheduleError=invalid_time`
        : "/daily?scheduleError=invalid_time#schedule",
    );
  }

  try {
    await updateScheduleItemForUser({
      userId: user.id,
      scheduleId,
      title,
      description,
      category,
      startDate,
      endDate,
      recurrence,
      startTime: startTimeValue,
      endTime: endTimeValue || null,
      updatedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?scheduleError=save_failed`
        : "/daily?scheduleError=save_failed#schedule",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(baseDetailPath);

  if (source === "detail") {
    redirect(`${baseDetailPath}?scheduleUpdated=edited`);
  }

  redirect("/daily?scheduleUpdated=edited#schedule");
}

export async function softDeleteScheduleItemAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const scheduleId = getStringValue(formData, "scheduleId");
  const source = getStringValue(formData, "source");
  const baseDetailPath = scheduleId ? `/records/schedule/${scheduleId}` : "/records";

  if (!scheduleId) {
    redirect("/daily?scheduleError=missing_schedule#schedule");
  }

  try {
    await softDeleteScheduleItemForUser({
      userId: user.id,
      scheduleId,
      deletedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?scheduleError=save_failed`
        : "/daily?scheduleError=save_failed#schedule",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(baseDetailPath);

  if (source === "detail") {
    redirect("/records?scheduleDeleted=1");
  }

  redirect("/daily?scheduleUpdated=deleted#schedule");
}

export async function updateSchedulePinnedAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const scheduleId = getStringValue(formData, "scheduleId");

  if (!scheduleId) {
    redirect("/daily?scheduleError=missing_schedule#schedule");
  }

  try {
    await updateSchedulePinnedForUser({
      userId: user.id,
      scheduleId,
      isPinned: getPinnedValue(formData),
      updatedAt: new Date(),
    });
  } catch {
    redirect("/daily?scheduleError=save_failed#schedule");
  }

  revalidatePath("/daily");
  redirect("/daily?view=schedule&scheduleUpdated=pinned#schedule");
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

export async function updateLifeEventAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const eventId = getStringValue(formData, "eventId");
  const content = getStringValue(formData, "content");
  const source = getStringValue(formData, "source");
  const baseDetailPath = eventId ? `/records/event/${eventId}` : "/records";

  if (!eventId) {
    redirect("/daily?recordError=missing_event#notes");
  }

  if (!content) {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?recordError=missing_content`
        : "/daily?recordError=missing_content#notes",
    );
  }

  const dateValue = getStringValue(formData, "recordDate");
  const recordDate = isValidDateValue(dateValue) ? dateValue : getBeijingDateValue();
  const aiPermissionValue = getStringValue(formData, "aiAnalysisPermission");
  const aiAnalysisPermission = isAiAnalysisPermission(aiPermissionValue)
    ? aiPermissionValue
    : "summary_only";

  try {
    await updateLifeEventForUser({
      userId: user.id,
      eventId,
      eventDate: recordDate,
      content,
      emotionTags: getStringValues(formData, "emotionTags"),
      tags: getTagsValue(getStringValue(formData, "tags")),
      specificEvent: getStringValue(formData, "specificEvent") || null,
      nextAction: getStringValue(formData, "nextAction") || null,
      aiAnalysisPermission,
      summary: getStringValue(formData, "summary") || null,
      updatedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?recordError=save_failed`
        : "/daily?recordError=save_failed#notes",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(baseDetailPath);

  if (source === "detail") {
    redirect(`${baseDetailPath}?recordUpdated=event_edited`);
  }

  redirect("/daily?recordUpdated=event_edited#notes");
}

export async function softDeleteLifeEventAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const eventId = getStringValue(formData, "eventId");
  const source = getStringValue(formData, "source");
  const baseDetailPath = eventId ? `/records/event/${eventId}` : "/records";

  if (!eventId) {
    redirect("/daily?recordError=missing_event#notes");
  }

  try {
    await softDeleteLifeEventForUser({
      userId: user.id,
      eventId,
      deletedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?recordError=save_failed`
        : "/daily?recordError=save_failed#notes",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(baseDetailPath);

  if (source === "detail") {
    redirect("/records?eventDeleted=1");
  }

  redirect("/daily?recordUpdated=event_deleted#notes");
}

export async function updateLifeEventPinnedAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const eventId = getStringValue(formData, "eventId");

  if (!eventId) {
    redirect("/daily?recordError=missing_event#notes");
  }

  try {
    await updateLifeEventPinnedForUser({
      userId: user.id,
      eventId,
      isPinned: getPinnedValue(formData),
      updatedAt: new Date(),
    });
  } catch {
    redirect("/daily?recordError=save_failed#notes");
  }

  revalidatePath("/daily");
  redirect("/daily?view=notes&recordUpdated=pinned#notes");
}

export async function updateIdeaAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const ideaId = getStringValue(formData, "ideaId");
  const content = getStringValue(formData, "content");
  const source = getStringValue(formData, "source");
  const baseDetailPath = ideaId ? `/records/idea/${ideaId}` : "/records";

  if (!ideaId) {
    redirect("/daily?recordError=missing_idea#notes");
  }

  if (!content) {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?recordError=missing_content`
        : "/daily?recordError=missing_content#notes",
    );
  }

  const dateValue = getStringValue(formData, "ideaDate");
  const ideaDate = isValidDateValue(dateValue) ? dateValue : getBeijingDateValue();
  const statusValue = getStringValue(formData, "status");
  const status = isIdeaStatus(statusValue) ? statusValue : "to_review";

  try {
    await updateIdeaForUser({
      userId: user.id,
      ideaId,
      ideaDate,
      content,
      status,
      solutionNote: getStringValue(formData, "solutionNote") || null,
      updatedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?recordError=save_failed`
        : "/daily?recordError=save_failed#notes",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(baseDetailPath);

  if (source === "detail") {
    redirect(`${baseDetailPath}?recordUpdated=idea_edited`);
  }

  redirect("/daily?recordUpdated=idea_edited#notes");
}

export async function softDeleteIdeaAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const ideaId = getStringValue(formData, "ideaId");
  const source = getStringValue(formData, "source");
  const baseDetailPath = ideaId ? `/records/idea/${ideaId}` : "/records";

  if (!ideaId) {
    redirect("/daily?recordError=missing_idea#notes");
  }

  try {
    await softDeleteIdeaForUser({
      userId: user.id,
      ideaId,
      deletedAt: new Date(),
    });
  } catch {
    redirect(
      source === "detail"
        ? `${baseDetailPath}?recordError=save_failed`
        : "/daily?recordError=save_failed#notes",
    );
  }

  revalidatePath("/daily");
  revalidatePath("/records");
  revalidatePath("/insights");
  revalidatePath(baseDetailPath);

  if (source === "detail") {
    redirect("/records?ideaDeleted=1");
  }

  redirect("/daily?recordUpdated=idea_deleted#notes");
}

export async function updateIdeaPinnedAction(formData: FormData) {
  const user = await requireCurrentUser("/daily");
  const ideaId = getStringValue(formData, "ideaId");

  if (!ideaId) {
    redirect("/daily?recordError=missing_idea#notes");
  }

  try {
    await updateIdeaPinnedForUser({
      userId: user.id,
      ideaId,
      isPinned: getPinnedValue(formData),
      updatedAt: new Date(),
    });
  } catch {
    redirect("/daily?recordError=save_failed#notes");
  }

  revalidatePath("/daily");
  redirect("/daily?view=notes&recordUpdated=pinned#notes");
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
