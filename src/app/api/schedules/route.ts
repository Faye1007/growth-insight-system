import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  createScheduleItemForUser,
  getChecklistSchedulesForUser,
  getScheduleDetailForUser,
  softDeleteScheduleItemForUser,
  updateScheduleItemForUser,
} from "@/lib/data/user-data/index";
import { isTaskCategory, type TaskCategory } from "@/lib/tasks/options";
import { getBeijingDateValue } from "@/lib/date";
import { isScheduleRecurrence, type ScheduleRecurrence } from "@/lib/schedules/options";

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
  const startDate = typeof body.date === "string" ? body.date : getBeijingDateValue();
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
      startDate,
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

    const existingSchedule = await getScheduleDetailForUser(userId, scheduleId);
    if (!existingSchedule) {
      return apiError("日程不存在", 404);
    }

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const category: TaskCategory | undefined = typeof body.category === "string" && isTaskCategory(body.category)
      ? body.category
      : undefined;
    const startDate = typeof body.startDate === "string"
      ? body.startDate
      : typeof body.date === "string"
        ? body.date
        : undefined;
    const endDate = typeof body.endDate === "string" ? body.endDate : undefined;
    const description = typeof body.description === "string" ? body.description : undefined;
    const startTime = typeof body.startTime === "string" ? body.startTime : undefined;
    const endTime = typeof body.endTime === "string" ? body.endTime : undefined;
    const recurrence: ScheduleRecurrence | undefined =
      typeof body.recurrence === "string" && isScheduleRecurrence(body.recurrence)
        ? body.recurrence
        : undefined;

    if (
      title === undefined &&
      category === undefined &&
      startDate === undefined &&
      endDate === undefined &&
      description === undefined &&
      startTime === undefined &&
      endTime === undefined &&
      recurrence === undefined
    ) {
      return apiError("至少需要提供一个更新字段", 400);
    }
    if (title !== undefined && !title) {
      return apiError("日程标题不能为空", 400);
    }

    await updateScheduleItemForUser({
      userId,
      scheduleId,
      title: title ?? existingSchedule.title,
      description: description ?? existingSchedule.description,
      category: category ?? existingSchedule.category,
      startDate: startDate ?? existingSchedule.startDate,
      endDate: endDate ?? existingSchedule.endDate,
      startTime: startTime ?? existingSchedule.startTime ?? "",
      endTime: endTime ?? existingSchedule.endTime,
      recurrence: recurrence ?? existingSchedule.recurrence,
      updatedAt: now,
    });
    return apiResponse({ message: "日程已更新" });
  } catch {
    return apiError("更新日程失败", 500);
  }
}
