import { NextResponse } from "next/server";

const API_KEY_HEADER = "x-api-key";
const API_KEY_ENV = "API_SECRET_KEY";
const API_USER_ID_ENV = "API_USER_ID";

export function getApiConfig() {
  const key = process.env[API_KEY_ENV];
  const userId = process.env[API_USER_ID_ENV];

  return {
    hasApiKey: Boolean(key && key.trim().length > 0),
    key: key?.trim(),
    hasUserId: Boolean(userId && userId.trim().length > 0),
    userId: userId?.trim(),
  };
}

export async function requireApiKey(request: Request) {
  const config = getApiConfig();

  if (!config.hasApiKey) {
    return NextResponse.json(
      { error: "API 未配置，请联系管理员设置 API_SECRET_KEY" },
      { status: 503 },
    );
  }

  const providedKey = request.headers.get(API_KEY_HEADER);

  if (!providedKey || providedKey !== config.key) {
    return NextResponse.json(
      { error: "无效的 API Key" },
      { status: 401 },
    );
  }

  if (!config.hasUserId) {
    return NextResponse.json(
      { error: "API 用户 ID 未配置，请联系管理员设置 API_USER_ID" },
      { status: 503 },
    );
  }

  return { userId: config.userId! };
}

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
