import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  createTaskForUser,
  getTaskDetailForUser,
  getTasksForUser,
  softDeleteTaskForUser,
  updateTaskForUser,
  updateTaskStatusForUser,
} from "@/lib/data/user-data/index";
import { isTaskCategory, isTaskStatus, type TaskCategory, type TaskStatus } from "@/lib/tasks/options";
import { getBeijingDateValue } from "@/lib/date";

export async function GET(request: NextRequest) {
  const auth = await requireApiKey(request);
  if (auth instanceof Response) return auth;

  const { userId } = auth;
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || undefined;
  const status = url.searchParams.get("status") || undefined;

  try {
    const tasks = await getTasksForUser(userId, date, status);
    return apiResponse(tasks);
  } catch {
    return apiError("获取任务列表失败", 500);
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
    return apiError("任务标题不能为空", 400);
  }

  const category: TaskCategory = typeof body.category === "string" && isTaskCategory(body.category)
    ? body.category
    : "other";
  const taskDate = typeof body.date === "string" ? body.date : getBeijingDateValue();

  try {
    await createTaskForUser({
      userId,
      title,
      category,
      status: "todo",
      taskDate,
      completedAt: null,
    });
    return apiResponse({ message: "任务创建成功" }, 201);
  } catch {
    return apiError("创建任务失败", 500);
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

  const taskId = typeof body.id === "string" ? body.id : "";
  if (!taskId) {
    return apiError("任务 ID 不能为空", 400);
  }

  const action = typeof body.action === "string" ? body.action : "update";
  const now = new Date();

  try {
    if (action === "delete") {
      await softDeleteTaskForUser({ userId, taskId, deletedAt: now });
      return apiResponse({ message: "任务已删除" });
    }

    if (action === "status") {
      const status: TaskStatus | undefined = typeof body.status === "string" && isTaskStatus(body.status)
        ? body.status
        : undefined;
      if (!status) {
        return apiError("无效的任务状态", 400);
      }
      const completedAt = status === "completed" ? now : null;
      await updateTaskStatusForUser({ userId, taskId, status, completedAt, updatedAt: now });
      return apiResponse({ message: "任务状态已更新" });
    }

    const existingTask = await getTaskDetailForUser(userId, taskId);
    if (!existingTask) {
      return apiError("任务不存在", 404);
    }

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const category: TaskCategory | undefined = typeof body.category === "string" && isTaskCategory(body.category)
      ? body.category
      : undefined;
    const taskDate = typeof body.date === "string" ? body.date : undefined;
    const description = typeof body.description === "string" ? body.description : undefined;
    const reviewNote = typeof body.reviewNote === "string"
      ? body.reviewNote
      : typeof body.reviewNotes === "string"
        ? body.reviewNotes
        : undefined;
    const status: TaskStatus | undefined = typeof body.status === "string" && isTaskStatus(body.status)
      ? body.status
      : undefined;

    if (!title && !category && !taskDate && description === undefined && reviewNote === undefined && !status) {
      return apiError("至少需要提供一个更新字段", 400);
    }
    if (title !== undefined && !title) {
      return apiError("任务标题不能为空", 400);
    }

    const nextStatus = status ?? existingTask.status;
    const completedAt = status
      ? (status === "completed" ? now : null)
      : existingTask.completedAt;

    await updateTaskForUser({
      userId,
      taskId,
      title: title ?? existingTask.title,
      description: description ?? existingTask.description,
      category: category ?? existingTask.category,
      status: nextStatus,
      taskDate: taskDate ?? existingTask.taskDate,
      reviewNote: reviewNote ?? existingTask.reviewNote,
      completedAt,
      updatedAt: now,
    });
    return apiResponse({ message: "任务已更新" });
  } catch {
    return apiError("更新任务失败", 500);
  }
}
