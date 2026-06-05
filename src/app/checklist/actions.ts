"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  createHabitForUser,
  createIdeaForUser,
  createLifeEventForUser,
  createScheduleItemForUser,
  createTaskForUser,
  deleteScheduleCompletionForUser,
  getIdeaForConversionForUser,
  getTaskDateForUser,
  markIdeaConvertedToTaskForUser,
  postponeTaskForUser,
  updateHabitForUser,
  upsertScheduleCompletionForUser,
} from "@/lib/data/user-data/index";
import {
  batchSoftDeleteForUser,
} from "@/lib/data/user-data/index";
import { isTaskCategory } from "@/lib/tasks/options";
import { getBeijingDateValue } from "@/lib/date";
import { isScheduleRecurrence } from "@/lib/schedules/options";
import {
  getStringValue,
  getValidTaskDate,
  isValidDateValue,
  isValidTimeValue,
  normalizeTimeValue,
  getTagsValue,
  isAiAnalysisPermission,
} from "@/lib/actions/helpers";

export async function createChecklistTaskAction(formData: FormData) {
  const user = await requireCurrentUser("/checklist");
  const title = getStringValue(formData, "title");

  if (!title) {
    redirect("/checklist?tab=tasks&taskError=missing_title");
  }

  const categoryValue = getStringValue(formData, "category");
  const statusValue = getStringValue(formData, "status");
  const taskDate = getValidTaskDate(getStringValue(formData, "taskDate"));
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const status = statusValue === "todo" || statusValue === "in_progress" || statusValue === "completed" || statusValue === "postponed"
    ? statusValue
    : "todo";

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
    redirect("/checklist?tab=tasks&taskError=save_failed");
  }

  revalidatePath("/checklist");
  redirect("/checklist?tab=tasks&taskCreated=1");
}

export async function createChecklistScheduleAction(formData: FormData) {
  const user = await requireCurrentUser("/checklist");
  const title = getStringValue(formData, "title");

  if (!title) {
    redirect("/checklist?tab=schedules&scheduleError=missing_title");
  }

  const categoryValue = getStringValue(formData, "category");
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const startDate = getValidTaskDate(getStringValue(formData, "startDate"));
  const endDateRaw = getStringValue(formData, "endDate");
  const endDate = isValidDateValue(endDateRaw) ? endDateRaw : null;
  const recurrenceValue = getStringValue(formData, "recurrence");
  const recurrence = isScheduleRecurrence(recurrenceValue) ? recurrenceValue : "none";
  const startTimeRaw = getStringValue(formData, "startTime");
  const endTimeRaw = getStringValue(formData, "endTime");
  const startTime = startTimeRaw ? normalizeTimeValue(startTimeRaw) : "09:00";
  const endTime = endTimeRaw && isValidTimeValue(endTimeRaw) ? normalizeTimeValue(endTimeRaw) : null;

  if (!isValidTimeValue(startTime)) {
    redirect("/checklist?tab=schedules&scheduleError=missing_time");
  }

  if (endDate && endDate < startDate) {
    redirect("/checklist?tab=schedules&scheduleError=invalid_date_range");
  }

  try {
    await createScheduleItemForUser({
      userId: user.id,
      title,
      category,
      startDate,
      endDate,
      recurrence,
      startTime,
      endTime,
    });
  } catch (error) {
    console.error("[createChecklistScheduleAction] save failed:", error);
    redirect("/checklist?tab=schedules&scheduleError=save_failed");
  }

  revalidatePath("/checklist");
  redirect("/checklist?tab=schedules&scheduleCreated=1");
}

export async function createChecklistHabitAction(formData: FormData) {
  const user = await requireCurrentUser("/checklist");
  const name = getStringValue(formData, "name");

  if (!name) {
    redirect("/checklist?tab=habits&habitError=missing_name");
  }

  const categoryValue = getStringValue(formData, "category");
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const startDate = getValidTaskDate(getStringValue(formData, "startDate"));

  try {
    await createHabitForUser({
      userId: user.id,
      name,
      category,
      startDate,
    });
  } catch {
    redirect("/checklist?tab=habits&habitError=save_failed");
  }

  revalidatePath("/checklist");
  redirect("/checklist?tab=habits&habitCreated=1");
}

export async function createChecklistIdeaAction(formData: FormData) {
  const user = await requireCurrentUser("/checklist");
  const content = getStringValue(formData, "content");

  if (!content) {
    redirect("/checklist?tab=ideas&ideaError=missing_content");
  }

  const ideaDate = getValidTaskDate(getStringValue(formData, "ideaDate"));

  try {
    await createIdeaForUser({
      userId: user.id,
      content,
      ideaDate,
    });
  } catch {
    redirect("/checklist?tab=ideas&ideaError=save_failed");
  }

  revalidatePath("/checklist");
  redirect("/checklist?tab=ideas&ideaCreated=1");
}

export async function convertIdeaToTaskAction(formData: FormData) {
  const user = await requireCurrentUser("/checklist");
  const ideaId = getStringValue(formData, "ideaId");

  if (!ideaId) {
    redirect("/checklist?tab=ideas&ideaError=missing_id");
  }

  let idea: Awaited<ReturnType<typeof getIdeaForConversionForUser>>;
  try {
    idea = await getIdeaForConversionForUser(user.id, ideaId);
  } catch {
    redirect("/checklist?tab=ideas&ideaError=convert_failed");
  }

  if (!idea || idea.status !== "to_review") {
    redirect("/checklist?tab=ideas&ideaError=not_convertible");
  }

  try {
    const task = await createTaskForUser({
      userId: user.id,
      title: idea.content.slice(0, 120),
      category: "other",
      status: "todo",
      taskDate: getBeijingDateValue(),
      completedAt: null,
    });

    await markIdeaConvertedToTaskForUser({
      userId: user.id,
      ideaId,
      taskId: task.id,
      updatedAt: new Date(),
    });
  } catch {
    redirect("/checklist?tab=ideas&ideaError=convert_failed");
  }

  revalidatePath("/checklist");
  revalidatePath("/records");
  redirect("/checklist?tab=tasks&taskCreated=1");
}

export async function createChecklistEventAction(formData: FormData) {
  const user = await requireCurrentUser("/checklist");
  const content = getStringValue(formData, "content");

  if (!content) {
    redirect("/life?tab=events&eventError=missing_content");
  }

  const eventDate = getValidTaskDate(getStringValue(formData, "eventDate"));
  const aiPermission = getStringValue(formData, "aiAnalysisPermission");
  const permission = isAiAnalysisPermission(aiPermission) ? aiPermission : "summary_only";
  const emotionTags = getTagsValue(getStringValue(formData, "emotionTags"));
  const tags = getTagsValue(getStringValue(formData, "tags"));

  try {
    await createLifeEventForUser({
      userId: user.id,
      content,
      eventDate,
      aiAnalysisPermission: permission,
      emotionTags,
      tags,
    });
  } catch {
    redirect("/life?tab=events&eventError=save_failed");
  }

  revalidatePath("/life");
  redirect("/life?tab=events&eventCreated=1");
}

export async function updateChecklistHabitAction(formData: FormData) {
  const user = await requireCurrentUser("/checklist");
  const habitId = getStringValue(formData, "habitId");
  const name = getStringValue(formData, "name");

  if (!habitId) {
    redirect("/checklist?tab=habits&habitError=missing_id");
  }

  if (!name) {
    redirect(`/checklist/habits/${habitId}?habitError=missing_name`);
  }

  const categoryValue = getStringValue(formData, "category");
  const category = isTaskCategory(categoryValue) ? categoryValue : "other";
  const startDateRaw = getStringValue(formData, "startDate");
  const startDate = isValidDateValue(startDateRaw) ? startDateRaw : getBeijingDateValue();
  const description = getStringValue(formData, "description") || null;

  try {
    await updateHabitForUser({
      userId: user.id,
      habitId,
      name,
      description,
      category,
      startDate,
      updatedAt: new Date(),
    });
  } catch {
    redirect(`/checklist/habits/${habitId}?habitError=save_failed`);
  }

  revalidatePath(`/checklist/habits/${habitId}`);
  redirect(`/checklist/habits/${habitId}?habitUpdated=1`);
}

export async function toggleScheduleCompletionAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireCurrentUser("/checklist");
  } catch {
    return { success: false, error: "auth_required" };
  }
  const scheduleId = getStringValue(formData, "scheduleId");
  const completionDate = getStringValue(formData, "completionDate");
  const isCurrentlyCompleted = getStringValue(formData, "isCurrentlyCompleted") === "true";

  if (!scheduleId || !completionDate) {
    return { success: false, error: "missing_fields" };
  }

  try {
    if (isCurrentlyCompleted) {
      await deleteScheduleCompletionForUser({
        userId: user.id,
        scheduleId,
        completionDate,
      });
    } else {
      await upsertScheduleCompletionForUser({
        userId: user.id,
        scheduleId,
        completionDate,
        updatedAt: new Date(),
      });
    }
  } catch {
    return { success: false, error: "save_failed" };
  }

  revalidatePath("/checklist");
  return { success: true };
}

export async function postponeTaskAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser("/checklist");
    const taskId = formData.get("taskId");
    const postponedToDate = formData.get("postponedToDate");

    if (!taskId || typeof taskId !== "string") {
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
      postponedToDate: postponedToDate && typeof postponedToDate === "string" ? postponedToDate : null,
      updatedAt: new Date(),
    });

    revalidatePath("/daily");
    revalidatePath("/checklist");
    return { success: true };
  } catch {
    return { success: false, error: "save_failed" };
  }
}

export async function batchSoftDeleteAction(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser("/checklist");
    const kind = formData.get("kind");
    const idsRaw = formData.get("ids");
    if (!kind || typeof kind !== "string" || !idsRaw || typeof idsRaw !== "string") {
      return { success: false, error: "invalid_input" };
    }
    let ids: string[];
    try { ids = JSON.parse(idsRaw); }
    catch { return { success: false, error: "invalid_ids" }; }
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "no_ids" };
    }
    await batchSoftDeleteForUser({
      userId: user.id,
      kind,
      ids,
      deletedAt: new Date(),
    });
    revalidatePath("/checklist");
    return { success: true };
  } catch {
    return { success: false, error: "save_failed" };
  }
}
