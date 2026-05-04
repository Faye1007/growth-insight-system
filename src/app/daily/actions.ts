"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { habits, tasks } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";
import { isTaskCategory, isTaskStatus } from "@/lib/tasks/options";

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

  await db.insert(tasks).values({
    userId: user.id,
    title,
    category,
    status,
    taskDate,
    completedAt: status === "completed" ? new Date() : null,
  });

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

  const [existingTask] = await db
    .select({ taskDate: tasks.taskDate })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    .limit(1);

  if (!existingTask) {
    redirect("/daily?taskError=missing_task#tasks");
  }

  const now = new Date();

  if (statusValue === "postponed") {
    const postponedToDate = getStringValue(formData, "postponedToDate");

    if (!isValidDateValue(postponedToDate)) {
      redirect("/daily?taskError=missing_postponed_date#tasks");
    }

    await db
      .update(tasks)
      .set({
        status: "postponed",
        taskDate: postponedToDate,
        isPostponed: true,
        postponedFromDate: existingTask.taskDate,
        postponedToDate,
        completedAt: null,
        updatedAt: now,
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

    revalidatePath("/daily");
    redirect("/daily?taskUpdated=postponed#tasks");
  }

  await db
    .update(tasks)
    .set({
      status: statusValue,
      completedAt: statusValue === "completed" ? now : null,
      updatedAt: now,
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

  revalidatePath("/daily");
  redirect(`/daily?taskUpdated=${statusValue}#tasks`);
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

  await db.insert(habits).values({
    userId: user.id,
    name,
    category,
    isActive: true,
    startDate,
  });

  revalidatePath("/daily");
  redirect("/daily?habitCreated=1#habits");
}
