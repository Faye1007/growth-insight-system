import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  createLifeEventForUser,
  getEventDetailForUser,
  getLifeEventsForUser,
  softDeleteLifeEventForUser,
  updateLifeEventForUser,
} from "@/lib/data/user-data";
import { getBeijingDateValue } from "@/lib/date";

export async function GET(request: NextRequest) {
  const auth = await requireApiKey(request);
  if (auth instanceof Response) return auth;

  const { userId } = auth;
  const url = new URL(request.url);
  const dateFrom = url.searchParams.get("dateFrom") || getBeijingDateValue(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const dateTo = url.searchParams.get("dateTo") || getBeijingDateValue();

  try {
    const events = await getLifeEventsForUser(userId, dateFrom, dateTo);
    return apiResponse(events);
  } catch {
    return apiError("获取事件列表失败", 500);
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

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return apiError("事件内容不能为空", 400);
  }

  const eventDate = typeof body.date === "string" ? body.date : getBeijingDateValue();
  const aiPermissionRaw = typeof body.aiPermission === "string" ? body.aiPermission : "summary_only";
  const aiAnalysisPermission = (["none", "summary_only", "allow_original"].includes(aiPermissionRaw)
    ? aiPermissionRaw
    : "summary_only") as "none" | "summary_only" | "allow_original";
  const emotionTags = Array.isArray(body.emotionTags)
    ? body.emotionTags.filter((t): t is string => typeof t === "string")
    : [];
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string")
    : [];

  try {
    await createLifeEventForUser({
      userId,
      content,
      eventDate,
      aiAnalysisPermission,
      emotionTags,
      tags,
    });
    return apiResponse({ message: "事件创建成功" }, 201);
  } catch {
    return apiError("创建事件失败", 500);
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

  const eventId = typeof body.id === "string" ? body.id : "";
  if (!eventId) {
    return apiError("事件 ID 不能为空", 400);
  }

  const action = typeof body.action === "string" ? body.action : "update";
  const now = new Date();

  try {
    if (action === "delete") {
      await softDeleteLifeEventForUser({ userId, eventId, deletedAt: now });
      return apiResponse({ message: "事件已删除" });
    }

    const existingEvent = await getEventDetailForUser(userId, eventId);
    if (!existingEvent) {
      return apiError("事件不存在", 404);
    }

    const content = typeof body.content === "string" ? body.content.trim() : undefined;
    const eventDate = typeof body.date === "string" ? body.date : undefined;
    const aiPermissionRaw = typeof body.aiPermission === "string" ? body.aiPermission : undefined;
    const aiAnalysisPermission = aiPermissionRaw
      ? (["none", "summary_only", "allow_original"].includes(aiPermissionRaw)
        ? aiPermissionRaw
        : "summary_only") as "none" | "summary_only" | "allow_original"
      : undefined;
    const emotionTags = Array.isArray(body.emotionTags)
      ? body.emotionTags.filter((t): t is string => typeof t === "string")
      : undefined;
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((t): t is string => typeof t === "string")
      : undefined;

    if (
      content === undefined &&
      eventDate === undefined &&
      aiAnalysisPermission === undefined &&
      emotionTags === undefined &&
      tags === undefined &&
      typeof body.specificEvent !== "string" &&
      typeof body.nextAction !== "string" &&
      typeof body.summary !== "string"
    ) {
      return apiError("至少需要提供一个更新字段", 400);
    }
    if (content !== undefined && !content) {
      return apiError("事件内容不能为空", 400);
    }

    await updateLifeEventForUser({
      userId,
      eventId,
      content: content ?? existingEvent.content,
      eventDate: eventDate ?? existingEvent.eventDate,
      aiAnalysisPermission: aiAnalysisPermission ?? existingEvent.aiAnalysisPermission,
      emotionTags: emotionTags ?? existingEvent.emotionTags,
      tags: tags ?? existingEvent.tags,
      specificEvent: typeof body.specificEvent === "string" ? body.specificEvent : existingEvent.specificEvent,
      nextAction: typeof body.nextAction === "string" ? body.nextAction : existingEvent.nextAction,
      summary: typeof body.summary === "string" ? body.summary : existingEvent.summary,
      updatedAt: now,
    });
    return apiResponse({ message: "事件已更新" });
  } catch {
    return apiError("更新事件失败", 500);
  }
}
