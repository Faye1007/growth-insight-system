import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  createScheduleItemForUser,
  getChecklistSchedulesForUser,
  softDeleteScheduleItemForUser,
  updateScheduleItemForUser,
} from "@/lib/data/user-data";
import { isTaskCategory, type TaskCategory } from "@/lib/tasks/options";

function getBeijingDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export async function GET(request: NextRequest) {
  const auth = await requireApiKey(request);
  if (auth instanceof Response) return auth;

  const { userId } = auth;
  const url = new URL(request.url);
  const dateFrom = url.searchParams.get("dateFrom") || getBeijingDateValue();
  const dateTo = url.searchParams.get("dateTo") || getBeijingDateValue();

  try {
    const schedules = await getChecklistSchedulesForUser(userId, dateFrom, dateTo);
    return apiResponse(schedules);
  } catch {
    return apiError("获取日程列表失败", 500);
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

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return apiError("日程标题不能为空", 400);
  }

  const category: TaskCategory = typeof body.category === "string" && isTaskCategory(body.category)
    ? body.category
    : "other";
  const scheduleDate = typeof body.date === "string" ? body.date : getBeijingDateValue();
  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  const endTime = typeof body.endTime === "string" ? body.endTime : null;
  const recurrence = (typeof body.recurrence === "string" && ["none", "daily", "weekly", "monthly"].includes(body.recurrence)
    ? body.recurrence
    : "none") as "none" | "daily" | "weekly" | "monthly";

  if (!startTime) {
    return apiError("日程开始时间不能为空", 400);
  }

  try {
    await createScheduleItemForUser({
      userId,
      title,
      category,
      scheduleDate,
      startDate: scheduleDate,
      endDate: null,
      recurrence,
      startTime,
      endTime,
    });
    return apiResponse({ message: "日程创建成功" }, 201);
  } catch {
    return apiError("创建日程失败", 500);
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

  const scheduleId = typeof body.id === "string" ? body.id : "";
  if (!scheduleId) {
    return apiError("日程 ID 不能为空", 400);
  }

  const action = typeof body.action === "string" ? body.action : "update";
  const now = new Date();

  try {
    if (action === "delete") {
      await softDeleteScheduleItemForUser({ userId, scheduleId, deletedAt: now });
      return apiResponse({ message: "日程已删除" });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const category: TaskCategory = typeof body.category === "string" && isTaskCategory(body.category)
      ? body.category
      : "other";
    const scheduleDate = typeof body.date === "string" ? body.date : getBeijingDateValue();
    const startTime = typeof body.startTime === "string" ? body.startTime : "";
    const endTime = typeof body.endTime === "string" ? body.endTime : null;
    const recurrence = (typeof body.recurrence === "string" && ["none", "daily", "weekly", "monthly"].includes(body.recurrence)
      ? body.recurrence
      : "none") as "none" | "daily" | "weekly" | "monthly";

    await updateScheduleItemForUser({
      userId,
      scheduleId,
      title,
      description: null,
      category,
      scheduleDate,
      startDate: scheduleDate,
      endDate: null,
      startTime,
      endTime,
      recurrence,
      updatedAt: now,
    });
    return apiResponse({ message: "日程已更新" });
  } catch {
    return apiError("更新日程失败", 500);
  }
}
