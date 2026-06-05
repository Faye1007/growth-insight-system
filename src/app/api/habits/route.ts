import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  createHabitForUser,
  deactivateHabitForUser,
  getActiveHabitsForUser,
  softDeleteHabitForUser,
  updateHabitForUser,
  upsertHabitCheckinForUser,
} from "@/lib/data/user-data/index";
import { isTaskCategory, type TaskCategory } from "@/lib/tasks/options";
import { getBeijingDateValue } from "@/lib/date";

export async function GET(request: NextRequest) {
  const auth = await requireApiKey(request);
  if (auth instanceof Response) return auth;

  const { userId } = auth;

  try {
    const habits = await getActiveHabitsForUser(userId);
    return apiResponse(habits);
  } catch {
    return apiError("获取习惯列表失败", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiKey(request);
  if (auth instanceof Response) return auth;

  const { userId } = auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("请求体格式错误", 400);
  }

  const action = typeof body.action === "string" ? body.action : "create";

  if (action === "checkin") {
    const habitId = typeof body.habitId === "string" ? body.habitId : "";
    if (!habitId) {
      return apiError("习惯 ID 不能为空", 400);
    }
    const checkinDate = typeof body.date === "string" ? body.date : getBeijingDateValue();
    const status = body.status === "skipped" ? "skipped" : "checked" as const;

    try {
      await upsertHabitCheckinForUser({ userId, habitId, checkinDate, status, updatedAt: new Date() });
      return apiResponse({ message: status === "checked" ? "打卡成功" : "已取消打卡" }, 201);
    } catch {
      return apiError("打卡操作失败", 500);
    }
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return apiError("习惯名称不能为空", 400);
  }

  const category: TaskCategory = typeof body.category === "string" && isTaskCategory(body.category)
    ? body.category
    : "other";
  const startDate = typeof body.startDate === "string" ? body.startDate : getBeijingDateValue();
  const description = typeof body.description === "string" ? body.description.trim() : null;

  try {
    await createHabitForUser({ userId, name, category, startDate });
    if (description) {
      const habits = await getActiveHabitsForUser(userId);
      const newHabit = habits.find((h) => h.name === name);
      if (newHabit) {
        await updateHabitForUser({
          userId,
          habitId: newHabit.id,
          name,
          description,
          category,
          startDate,
          updatedAt: new Date(),
        });
      }
    }
    return apiResponse({ message: "习惯创建成功" }, 201);
  } catch {
    return apiError("创建习惯失败", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiKey(request);
  if (auth instanceof Response) return auth;

  const { userId } = auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("请求体格式错误", 400);
  }

  const habitId = typeof body.id === "string" ? body.id : "";
  if (!habitId) {
    return apiError("习惯 ID 不能为空", 400);
  }

  const action = typeof body.action === "string" ? body.action : "update";
  const now = new Date();

  try {
    if (action === "delete") {
      await softDeleteHabitForUser({ userId, habitId, deletedAt: now });
      return apiResponse({ message: "习惯已删除" });
    }

    if (action === "deactivate") {
      await deactivateHabitForUser({ userId, habitId, updatedAt: now });
      return apiResponse({ message: "习惯已停用" });
    }

    const habits = await getActiveHabitsForUser(userId);
    const existing = habits.find((h) => h.id === habitId);
    if (!existing) {
      return apiError("习惯不存在", 404);
    }

    const name = typeof body.name === "string" ? body.name.trim() : existing.name;
    const category: TaskCategory = typeof body.category === "string" && isTaskCategory(body.category)
      ? body.category
      : existing.category;
    const startDate = typeof body.startDate === "string"
      ? body.startDate
      : (existing.startDate ?? getBeijingDateValue());
    const description = typeof body.description === "string" ? body.description : (existing.description ?? null);

    await updateHabitForUser({
      userId,
      habitId,
      name,
      description,
      category,
      startDate,
      updatedAt: now,
    });
    return apiResponse({ message: "习惯已更新" });
  } catch {
    return apiError("更新习惯失败", 500);
  }
}
