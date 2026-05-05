import "server-only";

import type { AiRuntimeConfig } from "@/lib/ai/config";
import type { GenerateReviewInput, GenerateReviewOutput } from "@/lib/ai/types";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type ReviewJsonPayload = {
  title?: unknown;
  summary?: unknown;
  patterns?: unknown;
  suggestions?: unknown;
  nextActions?: unknown;
};

function buildChatCompletionsUrl(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (trimmedBaseUrl.endsWith("/chat/completions")) {
    return trimmedBaseUrl;
  }

  if (trimmedBaseUrl.endsWith("/v1")) {
    return `${trimmedBaseUrl}/chat/completions`;
  }

  return `${trimmedBaseUrl}/v1/chat/completions`;
}

function buildReviewPrompt(input: GenerateReviewInput) {
  return [
    "你是一个个人成长复盘助手，只根据用户提供的结构化数据生成复盘。",
    "输出必须是 JSON，不要输出 Markdown，也不要输出 JSON 之外的解释。",
    "JSON 字段固定为 title、summary、patterns、suggestions、nextActions。",
    "patterns、suggestions、nextActions 必须是字符串数组。",
    "复盘应具体、克制、可执行，不要编造输入里没有的数据。",
    "",
    `复盘类型：${input.reviewType}`,
    `日期范围：${input.dateRange.start} 到 ${input.dateRange.end}`,
    `敏感模式：${input.sensitiveMode}`,
    "",
    "程序统计：",
    JSON.stringify(input.stats, null, 2),
    "",
    "关键记录摘要：",
    JSON.stringify(input.highlights, null, 2),
    "",
    "用户确认允许发送的事件原文：",
    JSON.stringify(input.selectedOriginals ?? [], null, 2),
  ].join("\n");
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function extractJsonContent(content: string) {
  const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1];
  }

  const firstBraceIndex = content.indexOf("{");
  const lastBraceIndex = content.lastIndexOf("}");

  if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
    return content.slice(firstBraceIndex, lastBraceIndex + 1);
  }

  return content;
}

function normalizeReviewPayload(
  payload: ReviewJsonPayload,
  config: AiRuntimeConfig,
): GenerateReviewOutput {
  return {
    title: getStringValue(payload.title) || "今日复盘",
    summary: getStringValue(payload.summary),
    patterns: parseStringArray(payload.patterns),
    suggestions: parseStringArray(payload.suggestions),
    nextActions: parseStringArray(payload.nextActions),
    modelProvider: config.provider,
    modelName: config.model,
  };
}

export async function generateOpenAiCompatibleReview(
  input: GenerateReviewInput,
  config: AiRuntimeConfig,
): Promise<GenerateReviewOutput> {
  const response = await fetch(buildChatCompletionsUrl(config.baseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content: "你只输出可解析 JSON，用中文写个人成长复盘。",
        },
        {
          role: "user",
          content: buildReviewPrompt(input),
        },
      ],
      temperature: 0.4,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI provider returned an empty response.");
  }

  const parsed = JSON.parse(extractJsonContent(content)) as ReviewJsonPayload;

  return normalizeReviewPayload(parsed, config);
}
