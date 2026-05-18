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
} from "@/lib/data/user-data";
import { isTaskCategory } from "@/lib/tasks/options";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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
  const startTime = getStringValue(formData, "startTime");
  const endTime = getStringValue(formData, "endTime");

  if (!startTime || !isValidTimeValue(startTime)) {
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
      scheduleDate: startDate,
      startDate,
      endDate,
      recurrence: "none",
      startTime,
      endTime: endTime && isValidTimeValue(endTime) ? endTime : null,
    });
  } catch {
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
