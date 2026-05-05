const aiProvider = process.env.AI_PROVIDER;
const aiBaseUrl = process.env.AI_BASE_URL;
const aiApiKey = process.env.AI_API_KEY;
const dailyModel = process.env.AI_MODEL_DAILY;
const weeklyModel = process.env.AI_MODEL_WEEKLY;
const monthlyModel = process.env.AI_MODEL_MONTHLY;

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

export function getAiConfigStatus(): AiConfigStatus {
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
