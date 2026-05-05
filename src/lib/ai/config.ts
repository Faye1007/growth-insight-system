import "server-only";

import type { ReviewType } from "@/lib/ai/types";

function readEnvValue(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

export type AiConfigStatus = {
  hasProvider: boolean;
  hasBaseUrl: boolean;
  hasApiKey: boolean;
  hasDailyModel: boolean;
  hasWeeklyModel: boolean;
  hasMonthlyModel: boolean;
  isDailyReviewReady: boolean;
  isAnyReviewModelConfigured: boolean;
  providerName: string | null;
  dailyModelName: string | null;
  weeklyModelName: string | null;
  monthlyModelName: string | null;
};

export type AiRuntimeConfig = {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  reviewType: ReviewType;
};

type AiConfigEnvName =
  | "AI_PROVIDER"
  | "AI_BASE_URL"
  | "AI_API_KEY"
  | "AI_MODEL_DAILY"
  | "AI_MODEL_WEEKLY"
  | "AI_MODEL_MONTHLY";

export type AiRuntimeConfigResult =
  | {
      ok: true;
      config: AiRuntimeConfig;
    }
  | {
      ok: false;
      missing: AiConfigEnvName[];
    };

function getModelEnvName(reviewType: ReviewType) {
  if (reviewType === "weekly") {
    return "AI_MODEL_WEEKLY" as const;
  }

  if (reviewType === "monthly") {
    return "AI_MODEL_MONTHLY" as const;
  }

  return "AI_MODEL_DAILY" as const;
}

export function getAiConfigStatus(): AiConfigStatus {
  const aiProvider = readEnvValue("AI_PROVIDER");
  const aiBaseUrl = readEnvValue("AI_BASE_URL");
  const aiApiKey = readEnvValue("AI_API_KEY");
  const dailyModel = readEnvValue("AI_MODEL_DAILY");
  const weeklyModel = readEnvValue("AI_MODEL_WEEKLY");
  const monthlyModel = readEnvValue("AI_MODEL_MONTHLY");
  const hasProvider = Boolean(aiProvider);
  const hasBaseUrl = Boolean(aiBaseUrl);
  const hasApiKey = Boolean(aiApiKey);
  const hasDailyModel = Boolean(dailyModel);
  const hasWeeklyModel = Boolean(weeklyModel);
  const hasMonthlyModel = Boolean(monthlyModel);

  return {
    hasProvider,
    hasBaseUrl,
    hasApiKey,
    hasDailyModel,
    hasWeeklyModel,
    hasMonthlyModel,
    isDailyReviewReady: hasProvider && hasBaseUrl && hasApiKey && hasDailyModel,
    isAnyReviewModelConfigured: hasDailyModel || hasWeeklyModel || hasMonthlyModel,
    providerName: aiProvider ?? null,
    dailyModelName: dailyModel ?? null,
    weeklyModelName: weeklyModel ?? null,
    monthlyModelName: monthlyModel ?? null,
  };
}

export function getAiRuntimeConfig(reviewType: ReviewType): AiRuntimeConfigResult {
  const provider = readEnvValue("AI_PROVIDER");
  const baseUrl = readEnvValue("AI_BASE_URL");
  const apiKey = readEnvValue("AI_API_KEY");
  const modelEnvName = getModelEnvName(reviewType);
  const model = readEnvValue(modelEnvName);
  const missing: AiConfigEnvName[] = [];

  if (!provider) {
    missing.push("AI_PROVIDER");
  }

  if (!baseUrl) {
    missing.push("AI_BASE_URL");
  }

  if (!apiKey) {
    missing.push("AI_API_KEY");
  }

  if (!model) {
    missing.push(modelEnvName);
  }

  if (missing.length || !provider || !baseUrl || !apiKey || !model) {
    return {
      ok: false,
      missing,
    };
  }

  return {
    ok: true,
    config: {
      provider,
      baseUrl,
      apiKey,
      model,
      reviewType,
    },
  };
}
