import "server-only";

import type { ReviewType } from "@/lib/ai/types";
import { getPersonalManualForUser, type PersonalManual } from "@/lib/data/user-data/index";

type ManualSection = {
  label: string;
  hasContent: boolean;
};

export type ReviewPersonalManualContext = {
  reviewType: ReviewType;
  manual: PersonalManual | null;
  filledSectionLabels: string[];
  includedInAiInput: false;
  previewRequiredBeforeAiInclusion: true;
};

function getFilledManualSections(manual: PersonalManual): string[] {
  const sections: ManualSection[] = [
    { label: "当前人生阶段", hasContent: Boolean(manual.lifeStage) },
    { label: "主要目标", hasContent: manual.currentGoals.length > 0 },
    { label: "能力画像", hasContent: Boolean(manual.abilityProfile) },
    { label: "情绪模式", hasContent: Boolean(manual.emotionPatterns) },
    { label: "高能量来源", hasContent: manual.energySources.length > 0 },
    { label: "常见内耗点", hasContent: manual.drainSources.length > 0 },
    { label: "反复出现的问题", hasContent: manual.recurringProblems.length > 0 },
    { label: "行动建议风格", hasContent: Boolean(manual.preferredActionStyle) },
    { label: "补充说明", hasContent: Boolean(manual.notes) },
  ];

  return sections.filter((section) => section.hasContent).map((section) => section.label);
}

export async function buildPersonalManualContextForReview(
  userId: string,
  reviewType: ReviewType,
): Promise<ReviewPersonalManualContext> {
  const manual = await getPersonalManualForUser(userId);

  return {
    reviewType,
    manual,
    filledSectionLabels: manual ? getFilledManualSections(manual) : [],
    includedInAiInput: false,
    previewRequiredBeforeAiInclusion: true,
  };
}
