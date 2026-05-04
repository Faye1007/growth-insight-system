"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { tasks } from "@/db/schema";
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
