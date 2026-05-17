import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  createIdeaForUser,
  getChecklistIdeasForUser,
  softDeleteIdeaForUser,
  updateIdeaForUser,
} from "@/lib/data/user-data";

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
  const dateFrom = url.searchParams.get("dateFrom") || getBeijingDateValue(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const dateTo = url.searchParams.get("dateTo") || getBeijingDateValue();

  try {
    const ideas = await getChecklistIdeasForUser(userId, dateFrom, dateTo);
    return apiResponse(ideas);
  } catch {
    return apiError("获取灵感列表失败", 500);
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
    return apiError("灵感内容不能为空", 400);
  }

  const ideaDate = typeof body.date === "string" ? body.date : getBeijingDateValue();

  try {
    await createIdeaForUser({
      userId,
      content,
      ideaDate,
    });
    return apiResponse({ message: "灵感创建成功" }, 201);
  } catch {
    return apiError("创建灵感失败", 500);
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

  const ideaId = typeof body.id === "string" ? body.id : "";
  if (!ideaId) {
    return apiError("灵感 ID 不能为空", 400);
  }

  const action = typeof body.action === "string" ? body.action : "update";
  const now = new Date();

  try {
    if (action === "delete") {
      await softDeleteIdeaForUser({ userId, ideaId, deletedAt: now });
      return apiResponse({ message: "灵感已删除" });
    }

    const content = typeof body.content === "string" ? body.content.trim() : undefined;
    const ideaDate = typeof body.date === "string" ? body.date : undefined;
    const statusRaw = typeof body.status === "string" ? body.status : undefined;
    const status = (["to_review", "converted_to_task", "shelved", "abandoned"].includes(statusRaw ?? "")
      ? statusRaw
      : "to_review") as "to_review" | "converted_to_task" | "shelved" | "abandoned";
    const solutionNote = typeof body.solutionNote === "string" ? body.solutionNote : undefined;

    await updateIdeaForUser({
      userId,
      ideaId,
      content: content ?? "",
      ideaDate: ideaDate ?? getBeijingDateValue(),
      status,
      solutionNote: solutionNote ?? null,
      updatedAt: now,
    });
    return apiResponse({ message: "灵感已更新" });
  } catch {
    return apiError("更新灵感失败", 500);
  }
}
